import { useCallback, useState } from 'react';

import { api } from '../lib/api';

function useSeeker() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/seeker/profile');
      const payload = response.data?.data || {};
      setProfile(payload.profile || null);
      setSkills(payload.skills || []);
      setResumes(payload.resumes || []);
      return payload;
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.put('/seeker/profile', values);
      return response.data?.data || null;
    } catch (updateError) {
      setError(updateError?.response?.data?.message || 'Unable to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResume = useCallback(async (file, isDefault = false) => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('isDefault', String(isDefault));

      // Do NOT manually specify 'Content-Type': 'multipart/form-data', Axios will set it with the boundary!
      const response = await api.post('/seeker/resume', formData);
      const uploadedResume = response.data?.data?.resume || null;

      if (uploadedResume) {
        setResumes((currentResumes) => {
          if (uploadedResume.is_default) {
            return [uploadedResume, ...currentResumes.map((r) => ({ ...r, is_default: false }))];
          }
          return [uploadedResume, ...currentResumes];
        });
      }

      return uploadedResume;
    } catch (uploadError) {
      const msg = uploadError?.response?.data?.message || uploadError?.message || 'Unable to upload resume';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadResume = useCallback(async (id, fileName = 'resume.pdf') => {
    try {
      const response = await api.get(`/seeker/resume/${id}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (downloadErr) {
      setError(downloadErr?.response?.data?.message || 'Unable to download resume');
      return false;
    }
  }, []);

  const getResumeBlobUrl = useCallback(async (id) => {
    try {
      const response = await api.get(`/seeker/resume/${id}?inline=true`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      return window.URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  const deleteResume = useCallback(async (id) => {
    setLoading(true);
    setError('');

    try {
      await api.delete(`/seeker/resume/${id}`);
      setResumes((currentResumes) => currentResumes.filter((resume) => resume.id !== Number(id)));
      return true;
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || 'Unable to delete resume');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    skills,
    resumes,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadResume,
    downloadResume,
    getResumeBlobUrl,
    deleteResume,
    setProfile,
    setSkills,
    setResumes,
  };
}

export { useSeeker };