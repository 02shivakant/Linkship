import { useState, useCallback } from 'react';
import { getLinks, createLink, deleteLink } from '../utils/api';

export const useLinks = () => {
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLinks = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLinks(page, 10);
      setLinks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load links');
    } finally {
      setLoading(false);
    }
  }, []);

  const addLink = useCallback(async (formData) => {
    const res = await createLink(formData);
    await fetchLinks(1);
    return res.data.data;
  }, [fetchLinks]);

  const removeLink = useCallback(async (id) => {
    await deleteLink(id);
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { links, pagination, loading, error, fetchLinks, addLink, removeLink };
};
