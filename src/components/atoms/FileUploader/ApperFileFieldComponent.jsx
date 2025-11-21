import React, { useEffect, useMemo, useRef, useState } from "react";
import Loading from "@/components/ui/Loading";

const ApperFileFieldComponent = ({ config, elementId }) => {
  // State management
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Refs for lifecycle tracking
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Memoize existing files to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    const files = config.existingFiles || [];
    
    // Return empty array if no files exist
    if (!files || files.length === 0) {
      return [];
    }

    // Check if files have changed (by comparing length and first file's ID)
    const currentFiles = existingFilesRef.current;
    if (files.length === currentFiles.length && 
        files.length > 0 && 
        currentFiles.length > 0 &&
        (files[0].Id === currentFiles[0].Id || files[0].id === currentFiles[0].id)) {
      return currentFiles; // Return previous reference to prevent update
    }

    return files;
  }, [config.existingFiles]);

  // Update elementId ref when it changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Initial mount effect
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Wait for ApperSDK to be available (max 50 attempts = 5 seconds)
        let attempts = 0;
        while (!window.ApperSDK && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        const { ApperFileUploader } = window.ApperSDK;
        
        // Set unique element ID
        elementIdRef.current = `file-uploader-${elementId}`;
        
        // Mount the file field
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });

        mountedRef.current = true;
        existingFilesRef.current = memoizedExistingFiles;
        setIsReady(true);
        setError(null);

      } catch (err) {
        console.error('Failed to initialize ApperFileFieldComponent:', err);
        setError(err.message);
        setIsReady(false);
      }
    };

    initializeComponent();

    // Cleanup on unmount
    return () => {
      try {
        if (mountedRef.current && window.ApperSDK?.ApperFileUploader) {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
        mountedRef.current = false;
        setIsReady(false);
      } catch (err) {
        console.error('Error during component cleanup:', err);
      }
    };
  }, [config.fieldKey, config.tableName]); // Only re-mount if critical config changes

  // File update effect
  useEffect(() => {
    const updateFiles = async () => {
      try {
        // Early returns for invalid states
        if (!isReady) return;
        if (!window.ApperSDK?.ApperFileUploader) return;
        if (!config.fieldKey) return;

        // Deep equality check to avoid unnecessary updates
        const currentFilesStr = JSON.stringify(existingFilesRef.current);
        const newFilesStr = JSON.stringify(memoizedExistingFiles);
        
        if (currentFilesStr === newFilesStr) return;

        const { ApperFileUploader } = window.ApperSDK;

        // Format detection and conversion
        let filesToUpdate = memoizedExistingFiles;
        
        if (filesToUpdate.length > 0) {
          // Check if format conversion is needed (API format has .Id, UI format has .id)
          const firstFile = filesToUpdate[0];
          if (firstFile.Id !== undefined && firstFile.id === undefined) {
            // Convert from API format to UI format
            filesToUpdate = ApperFileUploader.toUIFormat(filesToUpdate);
          }
        }

        // Update or clear files
        if (filesToUpdate.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }

        // Update reference
        existingFilesRef.current = memoizedExistingFiles;

      } catch (err) {
        console.error('Error updating files:', err);
        setError(`Failed to update files: ${err.message}`);
      }
    };

    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded-md bg-red-50">
        <p className="text-red-600 text-sm font-medium">File Upload Error</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="file-upload-container">
      <div 
        id={`file-uploader-${elementId}`}
        className="apper-file-field"
        style={{ minHeight: isReady ? 'auto' : '120px' }}
      >
        {!isReady && (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <svg className="animate-spin h-6 w-6 text-gray-400 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-500">Loading file uploader...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;