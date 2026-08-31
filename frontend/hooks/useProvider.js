import { useCallback, useState } from 'react';

import { api } from '../lib/api';

function useProvider() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/provider/profile');
      const payload = response.data?.data || {};
      setProfile(payload.profile || null);
      return payload.profile || null;
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load provider profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (values) => {
    setLoading(true);
    setError('');

    try {
      await api.put('/provider/profile', values);
      return true;
    } catch (updateError) {
      setError(updateError?.response?.data?.message || 'Unable to update provider profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/provider/jobs');
      const payload = response.data?.data || {};
      setJobs(payload.jobs || []);
      return payload.jobs || [];
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load provider jobs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJob = useCallback(async (id) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/provider/jobs/${id}`);
      const payload = response.data?.data || {};
      setJob(payload.job || null);
      return payload.job || null;
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load job');
      setJob(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/provider/jobs', values);
      return response.data?.data || null;
    } catch (createError) {
      const errData = createError?.response?.data;
      let errorMessage = errData?.message || createError?.message || 'Unable to create job';

      if (errData?.errors?.fieldErrors) {
        const fieldDetails = Object.entries(errData.errors.fieldErrors)
          .map(([f, m]) => `${f}: ${m.join(', ')}`)
          .join('; ');
        if (fieldDetails) {
          errorMessage = `${errData.message || 'Validation error'} (${fieldDetails})`;
        }
      }

      console.error('Job creation failed:', {
        status: createError?.response?.status,
        message: errorMessage,
        data: errData,
      });
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJob = useCallback(async (id, values) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.put(`/provider/jobs/${id}`, values);
      return response.data?.data || null;
    } catch (updateError) {
      const errData = updateError?.response?.data;
      let errorMessage = errData?.message || updateError?.message || 'Unable to update job';

      if (errData?.errors?.fieldErrors) {
        const fieldDetails = Object.entries(errData.errors.fieldErrors)
          .map(([f, m]) => `${f}: ${m.join(', ')}`)
          .join('; ');
        if (fieldDetails) {
          errorMessage = `${errData.message || 'Validation error'} (${fieldDetails})`;
        }
      }

      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteJob = useCallback(async (id) => {
    setLoading(true);
    setError('');

    try {
      await api.delete(`/provider/jobs/${id}`);
      setJobs((currentJobs) => currentJobs.filter((currentJob) => currentJob.id !== Number(id)));
      return true;
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || 'Unable to delete job');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobApplications = useCallback(async (id) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/provider/jobs/${id}/applications`);
      const payload = response.data?.data || {};
      setApplications(payload.applications || []);
      return payload.applications || [];
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load applicants');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllApplications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/provider/applications');
      const payload = response.data?.data || {};
      setAllApplications(payload.applications || []);
      return payload.applications || [];
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load applications');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateApplicationStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError('');

    try {
      await api.put(`/provider/applications/${id}/status`, { status });
      return true;
    } catch (updateError) {
      setError(updateError?.response?.data?.message || 'Unable to update application status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadApplicationResume = useCallback(async (id) => {
    const response = await api.get(`/provider/applications/${id}/resume`, { responseType: 'blob' });
    return response.data;
  }, []);

  return {
    profile,
    jobs,
    job,
    applications,
    allApplications,
    loading,
    error,
    fetchProfile,
    updateProfile,
    fetchJobs,
    fetchJob,
    createJob,
    updateJob,
    deleteJob,
    fetchJobApplications,
    fetchAllApplications,
    updateApplicationStatus,
    downloadApplicationResume,
    setProfile,
    setJobs,
    setJob,
    setApplications,
    setAllApplications,
  };
}

export { useProvider };