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

      const response = await api.post('/seeker/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data?.data?.resume || null;
    } catch (uploadError) {
      setError(uploadError?.response?.data?.message || 'Unable to upload resume');
      return null;
    } finally {
      setLoading(false);
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
    deleteResume,
    setProfile,
    setSkills,
    setResumes,
  };
}

export { useSeeker };