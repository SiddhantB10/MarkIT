import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for fetching data from an API
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred while fetching data');
        console.error('Fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Custom hook for lazy fetching (manual trigger)
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @returns {Object} - { data, loading, error, execute }
 */
export const useLazyFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (dynamicOptions = {}) => {
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        ...dynamicOptions,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = err.message || 'An error occurred while fetching data';
        setError(errorMessage);
        console.error('Fetch error:', err);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, execute };
};

export default useFetch;
