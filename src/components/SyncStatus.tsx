import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import StorageService from '../utils/storage';

interface SyncStatusProps {
  className?: string;
}

type SyncState = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

const SyncStatus: React.FC<SyncStatusProps> = ({ className = '' }) => {
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Check initial state
    if (StorageService.getOfflineMode()) {
      setSyncState('offline');
    } else {
      setSyncState('idle');
    }

    // Load last sync time from localStorage
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  }, []);

  const handleManualSync = async () => {
    if (StorageService.getOfflineMode()) {
      return;
    }

    setSyncState('syncing');
    setErrorMessage('');

    try {
      await StorageService.syncWithServer();
      setSyncState('success');
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());
      
      // Reset to idle after 3 seconds
      setTimeout(() => setSyncState('idle'), 3000);
    } catch (error) {
      setSyncState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Sync failed');
      
      // Reset to idle after 5 seconds
      setTimeout(() => setSyncState('idle'), 5000);
    }
  };

  const toggleOfflineMode = () => {
    const isOffline = StorageService.getOfflineMode();
    StorageService.setOfflineMode(!isOffline);
    setSyncState(!isOffline ? 'offline' : 'idle');
  };

  const getSyncIcon = () => {
    switch (syncState) {
      case 'syncing':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-3 w-3" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      case 'offline':
        return <WifiOff className="h-3 w-3" />;
      default:
        return <Wifi className="h-3 w-3" />;
    }
  };

  const getSyncVariant = () => {
    switch (syncState) {
      case 'syncing':
        return 'secondary';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'offline':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getSyncText = () => {
    switch (syncState) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return 'Synced';
      case 'error':
        return 'Sync failed';
      case 'offline':
        return 'Offline';
      default:
        return 'Online';
    }
  };

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getSyncVariant()} className="flex items-center gap-1">
        {getSyncIcon()}
        {getSyncText()}
      </Badge>
      
      {syncState !== 'offline' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualSync}
          disabled={syncState === 'syncing'}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${syncState === 'syncing' ? 'animate-spin' : ''}`} />
          Sync
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleOfflineMode}
        className="h-6 px-2 text-xs"
        title={StorageService.getOfflineMode() ? 'Go online' : 'Go offline'}
      >
        {StorageService.getOfflineMode() ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      </Button>
      
      {lastSyncTime && syncState !== 'offline' && (
        <span className="text-xs text-muted-foreground">
          Last sync: {formatLastSyncTime()}
        </span>
      )}
      
      {errorMessage && (
        <span className="text-xs text-destructive" title={errorMessage}>
          {errorMessage.length > 20 ? `${errorMessage.substring(0, 20)}...` : errorMessage}
        </span>
      )}
    </div>
  );
};

export default SyncStatus;
