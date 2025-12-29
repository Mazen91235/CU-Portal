import {useEffect} from 'react';
import {useLocation} from 'react-router';
import { showToast } from '../utils/ToastsManager';

export default function useRouteMessages() {
  const location = useLocation();

  useEffect(() => {
    const { success, error }: { success?: string; error?: string } = location.state || {};
    if (success) {
        showToast("success", "Success", success);
    }
    if (error) {
        showToast("error", "Error", error);
    }
  }, [location]);

  return null;
}