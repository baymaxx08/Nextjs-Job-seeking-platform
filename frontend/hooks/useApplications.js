import { useCallback, useState } from 'react';

import { api } from '../lib/api';

function useApplications() {
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/seeker/applications');
      const payload = response.data?.data || {};
      setApplications(payload.applications || []);
      return payload.applications || [];
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load applications');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/seeker/saved-jobs');
      const payload = response.data?.data || {};
      setSavedJobs(payload.saved_jobs || []);
      return payload.saved_jobs || [];
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load saved jobs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const applyToJob = useCallback(async (jobId, values) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/jobs/${jobId}/apply`, values);
      return response.data?.data?.application || null;
    } catch (applyError) {
      setError(applyError?.response?.data?.message || 'Unable to submit application');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const withdrawApplication = useCallback(async (id) => {
    setLoading(true);
    setError('');

    try {
      await api.delete(`/seeker/applications/${id}`);
      setApplications((currentApplications) => currentApplications.filter((application) => application.id !== Number(id)));
      return true;
    } catch (withdrawError) {
      setError(withdrawError?.response?.data?.message || 'Unable to withdraw application');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveJob = useCallback(async (jobId) => {
    await api.post(`/seeker/saved-jobs/${jobId}`);
    await fetchSavedJobs();
  }, [fetchSavedJobs]);

  const removeSavedJob = useCallback(async (jobId) => {
    await api.delete(`/seeker/saved-jobs/${jobId}`);
    await fetchSavedJobs();
  }, [fetchSavedJobs]);

  return {
    applications,
    savedJobs,
    loading,
    error,
    fetchApplications,
    fetchSavedJobs,
    applyToJob,
    withdrawApplication,
    saveJob,
    removeSavedJob,
    setApplications,
    setSavedJobs,
  };
}

export { useApplications };