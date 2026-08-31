import { useCallback, useState } from 'react';

import { api } from '../lib/api';

function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/jobs', { params: filters });
      const payload = response.data?.data || {};
      setJobs(payload.jobs || []);
      setPagination(payload.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      return payload;
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load jobs');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJob = useCallback(async (id) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/jobs/${id}`);
      const payload = response.data?.data || {};
      setJob(payload.job || null);
      return payload.job || null;
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load job details');
      setJob(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    jobs,
    job,
    pagination,
    loading,
    error,
    fetchJobs,
    fetchJob,
    setJobs,
    setJob,
  };
}

export { useJobs };