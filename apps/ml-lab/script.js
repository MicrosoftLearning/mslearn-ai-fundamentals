// Global variables - Updated: 2025-10-16 15:40:00 - Fixed PyScript to use proper training with ALL metrics
let currentStep = 1;
let maxSteps = 5;
let uploadedFiles = [];
let currentJobData = {};
let trainedModels = {};
let currentData = null;
let selectedModel = null;

// Job management
let jobHistory = [];
let jobCounter = 1;

// Workspace management
let existingWorkspaceNames = [];

// Model registration
let registeredModels = [];
let currentRegistrationContext = null;

// PyScript status (keeping for future use)
let pyScriptReady = false;

// Column selection tracking
let selectedColumns = new Set();

// Global error handler to catch forEach errors
window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('forEach')) {
        console.error('Global error caught:', {
            message: event.error.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error.stack
        });
    }
});

// Accessibility support functions
function handleKeyPress(event, callback) {
    // Handle Enter and Space key presses for clickable elements
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (typeof callback === 'function') {
            callback();
        }
    }
}

function handleDropdownKeyDown(event) {
    const dropdown = event.target.closest('.custom-dropdown');
    const options = dropdown.querySelector('.dropdown-options');
    
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleTaskTypeDropdown();
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (!options.style.display || options.style.display === 'none') {
            toggleTaskTypeDropdown();
        }
        // Focus first option
        const firstOption = options.querySelector('.task-type-option');
        if (firstOption) firstOption.focus();
    }
}

function handleOptionKeyDown(event) {
    const option = event.target;
    const options = option.parentElement;
    const allOptions = Array.from(options.querySelectorAll('.task-type-option'));
    const currentIndex = allOptions.indexOf(option);
    
    switch (event.key) {
        case 'Enter':
        case ' ':
            event.preventDefault();
            option.click();
            break;
        case 'ArrowDown':
            event.preventDefault();
            const nextIndex = (currentIndex + 1) % allOptions.length;
            allOptions[nextIndex].focus();
            break;
        case 'ArrowUp':
            event.preventDefault();
            const prevIndex = currentIndex === 0 ? allOptions.length - 1 : currentIndex - 1;
            allOptions[prevIndex].focus();
            break;
        case 'Escape':
            event.preventDefault();
            toggleTaskTypeDropdown();
            document.getElementById('task-type-selected').focus();
            break;
    }
}

function updateAriaExpanded(elementId, expanded) {
    const element = document.getElementById(elementId);
    if (element) {
        element.setAttribute('aria-expanded', expanded);
    }
}

function announceToScreenReader(message, priority = 'polite') {
    // Create a live region for screen reader announcements
    let liveRegion = document.getElementById('sr-live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'sr-live-region';
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
    }
    
    // Clear and set the message
    liveRegion.textContent = '';
    setTimeout(() => {
        liveRegion.textContent = message;
    }, 100);
}

function setupAccessibilityFeatures() {
    // Add focus indicators for better keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
        /* Enhanced focus indicators */
        .nav-item:focus,
        .learning-card:focus,
        .btn:focus,
        .tab-button:focus,
        .dropdown-selected:focus,
        .task-type-option:focus {
            outline: 2px solid #0078d4 !important;
            outline-offset: 2px !important;
        }
        
        /* Screen reader only content */
        .sr-only {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .nav-item, .btn, .learning-card {
                border: 1px solid;
            }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize accessibility features when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupAccessibilityFeatures();
});

// Column selection functions
function initializeSelectedColumns(columns) {
    // Initialize selectedColumns with all columns by default
    selectedColumns.clear();
    if (columns && Array.isArray(columns)) {
        columns.forEach(col => selectedColumns.add(col));
    } else {
        console.error('initializeSelectedColumns called with invalid columns:', columns);
    }
}

function toggleColumnSelection(columnName) {
    if (currentData && currentData.isSaved) {
        alert('Dataset is already saved. To make changes, please remove and re-upload the file.');
        return;
    }
    
    if (selectedColumns.has(columnName)) {
        selectedColumns.delete(columnName);
    } else {
        selectedColumns.add(columnName);
    }
    
    // Update the checkbox state (using escaped ID)
    const checkboxId = `col-select-${columnName.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        checkbox.checked = selectedColumns.has(columnName);
    }
    
    // Update select all checkbox state
    updateSelectAllCheckbox();
    
    // Update target column dropdown to only show selected columns
    updateTargetColumnDropdown();
}

function toggleColumnByIndex(columnIndex) {
    if (!currentData || !currentData.columns || columnIndex >= currentData.columns.length) {
        return;
    }
    
    const columnName = currentData.columns[columnIndex];
    toggleColumnSelection(columnName);
    
    // Update the checkbox using the index-based ID
    const checkbox = document.getElementById(`col-select-${columnIndex}`);
    if (checkbox) {
        checkbox.checked = selectedColumns.has(columnName);
    }
}

function toggleSelectAllColumns() {
    if (currentData && currentData.isSaved) {
        alert('Dataset is already saved. To make changes, please remove and re-upload the file.');
        return;
    }
    
    const selectAllCheckbox = document.getElementById('select-all-columns');
    if (!selectAllCheckbox || !currentData || !currentData.columns || !Array.isArray(currentData.columns)) return;
    
    if (selectAllCheckbox.checked) {
        // Select all columns
        currentData.columns.forEach(col => selectedColumns.add(col));
    } else {
        // Deselect all columns
        selectedColumns.clear();
    }
    
    // Update individual column checkboxes using index-based IDs
    currentData.columns.forEach((col, index) => {
        const checkbox = document.getElementById(`col-select-${index}`);
        if (checkbox) {
            checkbox.checked = selectedColumns.has(col);
        }
    });
    
    // Update target column dropdown to only show selected columns
    updateTargetColumnDropdown();
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('select-all-columns');
    if (!selectAllCheckbox || !currentData || !currentData.columns) return;
    
    const totalColumns = currentData.columns.length;
    const selectedCount = currentData.columns.filter(col => selectedColumns.has(col)).length;
    
    if (selectedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === totalColumns) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

function getSelectedColumns() {
    return Array.from(selectedColumns);
}

function getFilteredData() {
    if (!currentData || !currentData.preview) return null;
    
    const selectedCols = getSelectedColumns();
    if (selectedCols.length === 0) return null;
    
    // Filter preview data to only include selected columns
    const filteredPreview = currentData.preview.map(row => {
        const filteredRow = {};
        selectedCols.forEach(col => {
            if (row.hasOwnProperty(col)) {
                filteredRow[col] = row[col];
            }
        });
        return filteredRow;
    });
    
    return {
        ...currentData,
        columns: selectedCols,
        preview: filteredPreview,
        shape: [currentData.shape[0], selectedCols.length]
    };
}

function updateTargetColumnDropdown() {
    const targetSelect = document.getElementById('target-column');
    if (!targetSelect || !currentData) return;
    
    const selectedValue = targetSelect.value; // Save current selection
    
    // Use currentData.columns if selectedColumns is not properly initialized
    let columnsToUse = [];
    try {
        const selectedCols = getSelectedColumns();
        if (selectedCols && selectedCols.length > 0) {
            columnsToUse = selectedCols;
        } else if (currentData.columns && Array.isArray(currentData.columns)) {
            columnsToUse = currentData.columns;
        }
    } catch (error) {
        console.warn('Error getting selected columns, using all columns:', error);
        if (currentData.columns && Array.isArray(currentData.columns)) {
            columnsToUse = currentData.columns;
        }
    }
    
    targetSelect.innerHTML = '<option value="">Select target column</option>';
    
    if (columnsToUse && Array.isArray(columnsToUse)) {
        columnsToUse.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            option.textContent = `${column} (${currentData.dtypes && currentData.dtypes[column] ? currentData.dtypes[column] : 'unknown'})`;
            targetSelect.appendChild(option);
        });
        
        // Restore selection if the column is still available
        if (selectedValue && columnsToUse.includes(selectedValue)) {
            targetSelect.value = selectedValue;
        }
    }
}

// Utility functions
function getMetricDisplayName(metric, taskType) {
    const metricNames = {
        // Classification metrics
        'auc': 'AUC',
        'accuracy': 'Accuracy',
        'precision': 'Precision',
        'recall': 'Recall',
        'f1': 'F1 Score',
        // Regression metrics
        'mae': 'Mean Absolute Error',
        'rmse': 'Root Mean Squared Error',
        'r2': 'R² Score'
    };
    
    // Return the display name if found, otherwise use the original value or fallback
    return metricNames[metric] || metric || (taskType === 'classification' ? 'AUC' : 'Mean Absolute Error');
}

function isMetricHigherBetter(metric, taskType) {
    // Metrics where HIGHER values are better
    const higherIsBetter = ['auc', 'accuracy', 'precision', 'recall', 'f1', 'r2'];
    
    // Metrics where LOWER values are better  
    const lowerIsBetter = ['mae', 'rmse', 'mse', 'mean_absolute_error', 'root_mean_squared_error', 'mean_squared_error'];
    
    const metricLower = metric.toLowerCase();
    
    if (higherIsBetter.includes(metricLower)) {
        return true;
    } else if (lowerIsBetter.includes(metricLower)) {
        return false;
    } else {
        // Default based on task type
        return taskType === 'classification';
    }
}

// Start PyScript initialization when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Disable the new job button initially
    disableNewJobButton();
    // Disable the register model button initially
    disableRegisterButton();
    // Update initial status with specific message
    updatePyScriptStatus('Loading PyScript ML libraries (pandas, numpy, scikit-learn)...', false);
    
    // Check for PyScript readiness periodically
    checkPyScriptStatus();
});

function checkPyScriptStatus(attempts = 0) {
    const maxAttempts = 120; // 60 seconds total (500ms * 120)
    
    // Check if PyScript has set the global flag
    if (window.pyScriptReady) {
        notifyPyScriptReady();
        return;
    }
    
    // Check for timeout
    if (attempts >= maxAttempts) {
        console.error('PyScript loading timeout - ML training not available');
        updatePyScriptStatus('✗ ML libraries failed to load - Please refresh the page', false);
        // Keep button disabled - no fallback mode
        return;
    }
    
    // Try again in 500ms
    setTimeout(() => checkPyScriptStatus(attempts + 1), 500);
}

// Data management
let uploadedDataFiles = [];
let deployedEndpoints = [];
let deploymentSource = null; // Track if deployment is from 'model-details' or 'child-job'

// Header mode preference (true = use first row as headers, false = use custom headers)
let useFirstRowAsHeaders = true;

// Sidebar management
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

// Page Navigation
function showMyAccountPage() {
    // Hide all pages and show ML App page
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById('my-account-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showMyAccountPage()"]').classList.add('active');
    
    // Announce page change to screen readers
    announceToScreenReader('Navigated to ML App page');
    
    // Focus the main heading for screen readers
    const heading = document.getElementById('welcome-heading');
    if (heading) {
        heading.focus();
    }
}

function createWorkspace() {
    // Show the create workspace flyout panel
    const flyout = document.getElementById('create-workspace-flyout');
    
    if (flyout) {
        flyout.classList.add('active');
    } else {
        console.error('create-workspace-flyout element not found!');
        return;
    }
    
    // Set up input validation for the Create button
    const nameInput = document.getElementById('workspace-name');
    const createButton = document.querySelector('.flyout-actions .btn-primary');
    
    // Initially disable the Create button
    createButton.disabled = true;
    createButton.classList.add('disabled');
    
    // Add input listener to enable/disable Create button
    const validateInput = () => {
        const workspaceName = nameInput.value.trim();
        const errorDiv = document.getElementById('workspace-name-error');
        
        // Clear previous error
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        if (!workspaceName) {
            // Empty name
            createButton.disabled = true;
            createButton.classList.add('disabled');
        } else if (existingWorkspaceNames.includes(workspaceName)) {
            // Duplicate name
            errorDiv.textContent = 'A workspace with this name already exists';
            errorDiv.style.display = 'block';
            createButton.disabled = true;
            createButton.classList.add('disabled');
        } else {
            // Valid name
            createButton.disabled = false;
            createButton.classList.remove('disabled');
        }
    };
    
    // Remove existing listeners to avoid duplicates
    nameInput.removeEventListener('input', validateInput);
    nameInput.addEventListener('input', validateInput);
    
    // Add Enter key handler to activate Create button
    const handleEnterKey = (event) => {
        if (event.key === 'Enter' && !createButton.disabled) {
            createNewWorkspace();
        }
    };
    
    // Remove existing Enter key listener to avoid duplicates
    nameInput.removeEventListener('keypress', handleEnterKey);
    nameInput.addEventListener('keypress', handleEnterKey);
    
    // Initial validation
    validateInput();
    
    // Focus the name input after a short delay to ensure the flyout is visible
    setTimeout(() => {
        nameInput.focus();
    }, 100);
}

function closeCreateWorkspaceFlyout() {
    // Hide the create workspace flyout panel
    document.getElementById('create-workspace-flyout').classList.remove('active');
    
    // Reset the form
    document.getElementById('workspace-name').value = '';
    document.getElementById('resource-group').value = 'ResourceGroup1';
    
    // Clear error message
    const errorDiv = document.getElementById('workspace-name-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    
    // Re-disable the Create button
    const createButton = document.querySelector('.flyout-actions .btn-primary');
    createButton.disabled = true;
    createButton.classList.add('disabled');
}

function createNewWorkspace() {
    // Get the form values
    const workspaceName = document.getElementById('workspace-name').value;
    const resourceGroup = document.getElementById('resource-group').value;
    
    // Basic validation (should not be needed due to button being disabled)
    if (!workspaceName.trim()) {
        return;
    }
    
    // Check for duplicate names (extra safety check)
    if (existingWorkspaceNames.includes(workspaceName)) {
        console.error('Attempted to create workspace with duplicate name:', workspaceName);
        return;
    }
    
    // Add to existing workspace names list
    existingWorkspaceNames.push(workspaceName);
    
    // Simulate workspace creation
    console.log('Creating workspace:', { name: workspaceName, resourceGroup: resourceGroup });
    
    // Create workspace button in the workspaces list
    addWorkspaceButton(workspaceName);
    
    // Close the flyout
    closeCreateWorkspaceFlyout();
    
    // Clear the form for next use
    document.getElementById('workspace-name').value = '';
    document.getElementById('resource-group').value = 'ResourceGroup1';
    
    // Stay on the ML App page (no navigation needed)
}

function addWorkspaceButton(workspaceName) {
    // Get the workspaces list container
    const workspacesList = document.getElementById('workspaces-list');
    
    // Create the workspace button
    const workspaceButton = document.createElement('button');
    workspaceButton.className = 'workspace-button';
    workspaceButton.textContent = workspaceName;
    workspaceButton.onclick = function() {
        // Show full navigation and rename ML App when workspace is clicked
        showFullNavigationAndRename();
        
        // Set the current workspace and navigate to Home page
        setCurrentWorkspace(workspaceName);
        showHomePage();
    };
    
    // Add the button to the workspaces list
    workspacesList.appendChild(workspaceButton);
    
    // Note: Navigation changes happen only when user clicks the workspace button, not when it's created
}

function setCurrentWorkspace(workspaceName) {
    // Store the current workspace name
    window.currentWorkspaceName = workspaceName;
    
    // Update the workspace title on the Home page
    const workspaceTitle = document.getElementById('workspace-title');
    if (workspaceTitle) {
        workspaceTitle.textContent = workspaceName;
    }
}

// Simple navigation management
function initializeNavigation() {
    // Hide all navigation sections except ML App
    hideAllNavigationExceptMLApp();
}



function hideAllNavigationExceptMLApp() {
    // Hide Home section
    const homeSection = document.getElementById('home-nav-section');
    if (homeSection) {
        homeSection.style.display = 'none';
    }
    
    // Hide Authoring section
    const authoringSections = document.querySelectorAll('.nav-section');
    authoringSections.forEach(section => {
        const heading = section.querySelector('h3');
        if (heading && heading.textContent === 'Authoring') {
            section.style.display = 'none';
        }
    });
    
    // Hide Assets section
    const assetsSections = document.querySelectorAll('.nav-section');
    assetsSections.forEach(section => {
        const heading = section.querySelector('h3');
        if (heading && heading.textContent === 'Assets') {
            section.style.display = 'none';
        }
    });
}

function showFullNavigationAndRename() {
    // Rename ML App to All Workspaces
    const mlAppNavText = document.querySelector('.nav-item[onclick="showMyAccountPage()"] .nav-text');
    if (mlAppNavText) {
        mlAppNavText.textContent = 'All Workspaces';
    }
    
    // Show Home section
    const homeSection = document.getElementById('home-nav-section');
    if (homeSection) {
        homeSection.style.display = 'block';
    }
    
    // Show Authoring section
    const authoringSections = document.querySelectorAll('.nav-section');
    authoringSections.forEach(section => {
        const heading = section.querySelector('h3');
        if (heading && heading.textContent === 'Authoring') {
            section.style.display = 'block';
        }
    });
    
    // Show Assets section
    const assetsSections = document.querySelectorAll('.nav-section');
    assetsSections.forEach(section => {
        const heading = section.querySelector('h3');
        if (heading && heading.textContent === 'Assets') {
            section.style.display = 'block';
        }
    });
}

function showHomePage() {
    // Hide all pages and show Home page
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById('home-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showHomePage()"]').classList.add('active');
    
    // Update workspace title if a workspace is selected
    if (window.currentWorkspaceName) {
        const workspaceTitle = document.getElementById('workspace-title');
        if (workspaceTitle) {
            workspaceTitle.textContent = window.currentWorkspaceName;
        }
    }
}

function showAutoMLPage() {
    // Hide all pages and show AutoML page
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById('automl-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showAutoMLPage()"]').classList.add('active');
    
    // Announce page change to screen readers
    announceToScreenReader('Navigated to Automated ML page');
    
    // Focus the main heading for screen readers
    const heading = document.getElementById('automl-page-heading');
    if (heading) {
        heading.focus();
    }
}

function showDataPage() {
    // Hide all pages and show Data page
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById('data-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showDataPage()"]').classList.add('active');
    
    // Announce page change to screen readers
    announceToScreenReader('Navigated to Data page');
    
    // Focus the main heading for screen readers
    const heading = document.getElementById('data-page-heading');
    if (heading) {
        heading.focus();
    }
    
    // Update data files list
    updateDataFilesList();
}

function showJobsPage() {
    // Hide all pages and show Jobs page
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById('jobs-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showJobsPage()"]').classList.add('active');
    
    // Announce page change to screen readers
    announceToScreenReader('Navigated to Jobs page');
    
    // Focus the main heading for screen readers
    const heading = document.getElementById('jobs-page-heading');
    if (heading) {
        heading.focus();
    }
    
    // Update jobs list for the Jobs page
    updateJobsPageList();
}

function showModelsPage() {
    // Hide all pages and show Models page
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById('models-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showModelsPage()"]').classList.add('active');
    
    // Announce page change to screen readers
    announceToScreenReader('Navigated to Models page');
    
    // Focus the main heading for screen readers
    const heading = document.getElementById('models-page-heading');
    if (heading) {
        heading.focus();
    }
    
    // Update deployed models list
    updateDeployedModelsList();
}

function showEndpointsPage() {
    // Hide all pages and show Endpoints page
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById('endpoints-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showEndpointsPage()"]').classList.add('active');
    
    // Announce page change to screen readers
    announceToScreenReader('Navigated to Endpoints page');
    
    // Focus the main heading for screen readers
    const heading = document.getElementById('endpoints-page-heading');
    if (heading) {
        heading.focus();
    }
    
    // Update endpoints list
    updateEndpointsList();
}

// Wizard management
function openNewJobWizard() {
    // Hide all page content
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.style.display = 'none');
    
    // Show the wizard page
    const wizardPage = document.getElementById('automl-wizard-page');
    wizardPage.style.display = 'block';
    
    resetWizard();
    
    // Add event listeners for validation
    const jobNameInput = document.getElementById('job-name');
    jobNameInput.addEventListener('input', validateWizardStep);
    
    // Initial validation
    validateWizardStep();
}

function closeJobWizard() {
    // Hide wizard page
    const wizardPage = document.getElementById('automl-wizard-page');
    if (wizardPage) {
        wizardPage.style.display = 'none';
    }
    
    // Show AutoML page
    showAutoMLPage();
    
    resetWizard();
}

function resetWizard() {
    currentStep = 1;
    updateWizardStep();
    
    // Set default values with incrementing counters
    document.getElementById('job-name').value = `ML-Job-${jobCounter}`;
    
    // Reset other form data
    document.getElementById('task-type').value = '';
    const taskTypeSelected = document.getElementById('task-type-selected');
    taskTypeSelected.innerHTML = '<span class="placeholder">Select task type</span><span class="dropdown-arrow">▼</span>';
    document.querySelectorAll('.task-type-option').forEach(option => option.classList.remove('selected'));
    document.getElementById('data-file').value = '';
    document.getElementById('uploaded-files').innerHTML = '';
    document.getElementById('target-column').innerHTML = '<option value="">Select target column</option>';
    document.getElementById('target-column-group').style.display = 'none';
    document.getElementById('job-description').value = '';
    
    // Clear dataset name if it exists
    const datasetNameInput = document.getElementById('dataset-name');
    if (datasetNameInput) {
        datasetNameInput.value = '';
    }
    
    // Clear any error messages
    const errorDiv = document.getElementById('dataset-name-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    
    // Reset advanced configuration settings
    const metricThresholdInput = document.getElementById('metric-threshold');
    if (metricThresholdInput) {
        metricThresholdInput.value = '';
    }
    
    // Reset normalize features checkbox
    const normalizeFeaturesCheckbox = document.getElementById('normalize-features');
    if (normalizeFeaturesCheckbox) {
        normalizeFeaturesCheckbox.checked = false;
    }
    
    // Reset missing data strategy to default (remove)
    const missingDataRadios = document.querySelectorAll('input[name="missing-data-strategy"]');
    missingDataRadios.forEach(radio => {
        radio.checked = radio.value === 'remove';
    });
    
    // Reset primary metric dropdown
    const primaryMetricSelect = document.getElementById('primary-metric');
    if (primaryMetricSelect) {
        primaryMetricSelect.value = '';
    }
    
    // Reset algorithm selections (uncheck all)
    const algorithmsList = document.getElementById('algorithms-list');
    if (algorithmsList) {
        const algorithmCheckboxes = algorithmsList.querySelectorAll('input[type="checkbox"]');
        algorithmCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    // Reset experiment timeout
    const experimentTimeoutInput = document.getElementById('experiment-timeout');
    if (experimentTimeoutInput) {
        experimentTimeoutInput.value = '';
    }
    
    currentJobData = {};
    currentData = null;
    currentTarget = null;
    
    // Hide file upload group initially
    document.getElementById('file-upload-group').style.display = 'none';
    
    // Populate dataset list
    populateDatasetList();
}

// Data source selection functions
function selectDataSource(source) {
    const existingGroup = document.getElementById('existing-dataset-group');
    const uploadGroup = document.getElementById('file-upload-group');
    const existingRadio = document.getElementById('data-source-existing');
    const uploadRadio = document.getElementById('data-source-upload');
    
    if (source === 'existing') {
        existingRadio.checked = true;
        uploadRadio.checked = false;
        existingGroup.style.display = 'block';
        uploadGroup.style.display = 'none';
        
        // Populate existing datasets dropdown
        populateExistingDatasets();
        
        // Clear any current data from file upload
        currentData = null;
        document.getElementById('uploaded-files').innerHTML = '';
        document.getElementById('data-file').value = '';
    } else {
        uploadRadio.checked = true;
        existingRadio.checked = false;
        existingGroup.style.display = 'none';
        uploadGroup.style.display = 'block';
        
        // Clear existing dataset selection
        document.getElementById('existing-dataset').value = '';
    }
}

function populateExistingDatasets() {
    const select = document.getElementById('existing-dataset');
    select.innerHTML = '<option value="">Choose a dataset</option>';
    
    // Filter for saved datasets only
    const savedDatasets = uploadedDataFiles.filter(file => file.isSaved);
    
    savedDatasets.forEach(dataset => {
        const option = document.createElement('option');
        option.value = dataset.filename;
        option.textContent = `${dataset.filename} (${dataset.shape ? dataset.shape[0] + ' rows, ' + dataset.shape[1] + ' cols' : 'Unknown size'})`;
        select.appendChild(option);
    });
    
    if (savedDatasets.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No saved datasets available';
        option.disabled = true;
        select.appendChild(option);
    }
}

function handleExistingDatasetSelection(filename) {
    if (!filename) {
        currentData = null;
        return;
    }
    
    // Find the selected dataset
    const selectedDataset = uploadedDataFiles.find(file => file.filename === filename && file.isSaved);
    
    if (selectedDataset) {
        // Set as current data
        currentData = { ...selectedDataset };
        
        // Update target column dropdown
        const targetSelect = document.getElementById('target-column');
        targetSelect.innerHTML = '<option value="">Select target column</option>';
        
        console.log('Loading existing dataset:', selectedDataset);
        console.log('Columns:', selectedDataset.finalColumns || selectedDataset.columns);
        
        const columnsToUse = selectedDataset.finalColumns || selectedDataset.columns || [];
        columnsToUse.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            // Use dtypes if available, otherwise default
            const dtype = selectedDataset.dtypes && selectedDataset.dtypes[column] ? selectedDataset.dtypes[column] : 'unknown';
            option.textContent = `${column} (${dtype})`;
            targetSelect.appendChild(option);
        });

        document.getElementById('target-column-group').style.display = 'block';
        
        // Show success message
        const rows = selectedDataset.shape ? selectedDataset.shape[0] : 'Unknown';
        const cols = selectedDataset.shape ? selectedDataset.shape[1] : 'Unknown';
        console.log(`Selected existing dataset: ${selectedDataset.filename || selectedDataset.name || filename}: ${rows} rows, ${cols} columns`);
        
        // Display the dataset info in the uploaded files area
        displayExistingDatasetInfo(selectedDataset);
    }
}

function displayExistingDatasetInfo(dataset) {
    const uploadedFilesDiv = document.getElementById('uploaded-files');
    
    const fileDisplay = `
        <div class="uploaded-file">
            <span>📊 ${dataset.filename} (existing dataset)</span>
            <div style="margin-top: 5px; font-size: 12px; color: #666;">
                ${dataset.shape ? `${dataset.shape[0]} rows, ${dataset.shape[1]} columns` : 'Size unknown'} • 
                Saved: ${dataset.savedAt ? new Date(dataset.savedAt).toLocaleDateString() : 'Unknown'}
            </div>
        </div>
        <div class="data-preview" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; border: 1px solid #e1e4e8;">
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                Using saved dataset configuration
            </div>
            <div style="font-size: 11px; color: #28a745;">
                ✓ Dataset is ready for training
            </div>
        </div>
    `;
    
    uploadedFilesDiv.innerHTML = fileDisplay;
}

// New dataset list management functions
function showCreateDatasetInterface() {
    console.log('Showing create dataset interface');
    // Show the file upload group
    document.getElementById('file-upload-group').style.display = 'block';
    
    // Clear previous values
    document.getElementById('dataset-name').value = '';
    document.getElementById('data-file').value = '';
    document.getElementById('uploaded-files').innerHTML = '';
    
    // Hide any previous error messages
    const errorDiv = document.getElementById('dataset-name-error');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
}

function validateDatasetName() {
    const nameInput = document.getElementById('dataset-name');
    const datasetName = nameInput.value.trim();
    const errorDiv = document.getElementById('dataset-name-error');
    
    // Clear previous error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    if (!datasetName) {
        return false; // Don't show error for empty name yet
    }
    
    // Check for duplicate custom names only (not filenames)
    const existingDatasets = uploadedDataFiles.filter(file => file.isSaved);
    const isDuplicate = existingDatasets.some(dataset => 
        dataset.customName === datasetName
    );
    
    if (isDuplicate) {
        const errorMessage = 'A dataset with this name already exists. Please choose a different name.';
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
        
        // Announce error to screen readers
        announceToScreenReader(`Validation error: ${errorMessage}`, 'assertive');
        return false;
    }
    
    // Announce successful validation
    announceToScreenReader('Dataset name is valid');
    return true;
}

function populateDatasetList() {
    const datasetList = document.getElementById('dataset-list');
    
    // Filter for saved datasets only
    const savedDatasets = uploadedDataFiles.filter(file => file.isSaved);
    
    if (savedDatasets.length === 0) {
        datasetList.innerHTML = `
            <div class="no-datasets">
                <p>No datasets available. Create a dataset using the button above.</p>
            </div>
        `;
    } else {
        datasetList.innerHTML = '';
        
        savedDatasets.forEach((dataset, index) => {
            const datasetItem = document.createElement('div');
            datasetItem.className = 'dataset-item';
            const displayName = dataset.customName || dataset.filename;
            const datasetId = dataset.customName || dataset.filename;
            datasetItem.innerHTML = `
                <label class="dataset-option">
                    <input type="radio" name="selected-dataset" value="${datasetId}" onchange="selectExistingDataset('${datasetId}')">
                    <span class="dataset-name">${displayName}</span>
                </label>
            `;
            datasetList.appendChild(datasetItem);
        });
    }
}

function selectExistingDataset(datasetId) {
    // Find the selected dataset by custom name or filename
    const selectedDataset = uploadedDataFiles.find(file => 
        file.isSaved && ((file.customName && file.customName === datasetId) || file.filename === datasetId)
    );
    
    if (selectedDataset) {
        // Set as current data
        currentData = { ...selectedDataset };
        
        // Update target column dropdown
        const targetSelect = document.getElementById('target-column');
        targetSelect.innerHTML = '<option value="">Select target column</option>';
        
        console.log('Loading existing dataset:', selectedDataset);
        console.log('Columns:', selectedDataset.finalColumns || selectedDataset.columns);
        
        const columnsToUse = selectedDataset.finalColumns || selectedDataset.columns || [];
        columnsToUse.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            // Use dtypes if available, otherwise default
            const dtype = selectedDataset.dtypes && selectedDataset.dtypes[column] ? selectedDataset.dtypes[column] : 'unknown';
            option.textContent = `${column} (${dtype})`;
            targetSelect.appendChild(option);
        });

        document.getElementById('target-column-group').style.display = 'block';
        
        // Show success message
        const rows = selectedDataset.shape ? selectedDataset.shape[0] : 'Unknown';
        const cols = selectedDataset.shape ? selectedDataset.shape[1] : 'Unknown';
        console.log(`Selected existing dataset: ${selectedDataset.filename || selectedDataset.name || datasetId}: ${rows} rows, ${cols} columns`);
        
        // Display the dataset info in the uploaded files area
        displayExistingDatasetInfo(selectedDataset);
        
        // Clear file input since we're using existing dataset
        document.getElementById('data-file').value = '';
        
        // Validate wizard step to enable Next button
        validateWizardStep();
    }
}

function updateWizardStep() {
    // Update vertical step indicators
    document.querySelectorAll('.step-vertical').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Show/hide wizard steps
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    prevBtn.style.display = 'block'; // Always show Back button
    nextBtn.style.display = currentStep < maxSteps ? 'block' : 'none';
    submitBtn.style.display = currentStep === maxSteps ? 'block' : 'none';
    
    // Validate current step to enable/disable Next button
    validateWizardStep();
    
    // Update dataset list if on step 2
    if (currentStep === 2) {
        populateDatasetList();
    }
    
    // Update review summary if on step 5
    if (currentStep === 5) {
        updateJobSummary();
    }
    
    // Re-enable file input when returning to step 1
    if (currentStep === 1) {
        const fileInput = document.getElementById('data-file');
        if (fileInput && fileInput.disabled) {
            fileInput.disabled = false;
        }
    }
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < maxSteps) {
            currentStep++;
            updateWizardStep();
            
            // Announce step change to screen readers
            const stepNames = ['', 'Basic settings', 'Task type & data', 'Task settings', 'Compute', 'Review'];
            announceToScreenReader(`Moved to step ${currentStep}: ${stepNames[currentStep]}`);
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateWizardStep();
        
        // Announce step change to screen readers
        const stepNames = ['', 'Basic settings', 'Task type & data', 'Task settings', 'Compute', 'Review'];
        announceToScreenReader(`Moved back to step ${currentStep}: ${stepNames[currentStep]}`);
    } else {
        // On step 1, Back button acts like Cancel
        closeJobWizard();
    }
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            const jobName = document.getElementById('job-name').value.trim();
            
            if (!jobName) {
                const errorMessage = 'Please enter a job name.';
                alert(errorMessage);
                announceToScreenReader(`Validation error: ${errorMessage}`, 'assertive');
                document.getElementById('job-name').focus();
                return false;
            }
            
            currentJobData.jobName = jobName;
            return true;
            
        case 2:
            const taskType = document.getElementById('task-type').value;
            
            if (!taskType) {
                const errorMessage = 'Please select a task type.';
                alert(errorMessage);
                announceToScreenReader(`Validation error: ${errorMessage}`, 'assertive');
                document.getElementById('task-type-selected').focus();
                return false;
            }
            
            // Validate that a dataset is selected (either uploaded or from existing list)
            if (!currentData) {
                const errorMessage = 'Please create a new dataset or select an existing one.';
                alert(errorMessage);
                announceToScreenReader(`Validation error: ${errorMessage}`, 'assertive');
                return false;
            }
            
            if (!currentData.isSaved) {
                const errorMessage = 'Please save your dataset configuration before proceeding.';
                alert(errorMessage);
                announceToScreenReader(`Validation error: ${errorMessage}`, 'assertive');
                return false;
            }
            
            currentJobData.taskType = taskType;
            return true;
            
        case 3:
            // Task settings step - validate target column
            const targetColumn = document.getElementById('target-column').value;
            
            if (!targetColumn) {
                alert('Please select a target column.');
                return false;
            }
            
            // Capture limits data (optional fields)
            const metricThreshold = document.getElementById('metric-threshold').value;
            const experimentTimeout = document.getElementById('experiment-timeout').value;
            
            // Validate experiment timeout if provided
            if (experimentTimeout && parseInt(experimentTimeout) < 15) {
                alert('Experiment timeout must be at least 15 minutes.');
                return false;
            }
            
            // Validate metric threshold if provided
            if (metricThreshold) {
                const threshold = parseFloat(metricThreshold);
                const currentMetric = currentJobData.primaryMetric || (document.getElementById('task-type').value === 'classification' ? 'auc' : 'mae');
                
                // Define valid ranges for different metrics
                const metricRanges = {
                    // Classification metrics (0-1 range, higher is better)
                    'auc': { min: 0, max: 1, name: 'AUC' },
                    'accuracy': { min: 0, max: 1, name: 'Accuracy' },
                    'precision': { min: 0, max: 1, name: 'Precision' },
                    'recall': { min: 0, max: 1, name: 'Recall' },
                    'f1': { min: 0, max: 1, name: 'F1 Score' },
                    // Regression metrics (lower is better, no practical upper bound)
                    'mae': { min: 0, max: null, name: 'Mean Absolute Error' },
                    'rmse': { min: 0, max: null, name: 'Root Mean Squared Error' },
                    'r2': { min: null, max: 1, name: 'R² Score' }
                };
                
                const range = metricRanges[currentMetric];
                if (range) {
                    if (range.min !== null && threshold < range.min) {
                        alert(`Metric score threshold for ${range.name} must be at least ${range.min}.`);
                        return false;
                    }
                    if (range.max !== null && threshold > range.max) {
                        alert(`Metric score threshold for ${range.name} must be at most ${range.max}.`);
                        return false;
                    }
                }
            }
            
            currentJobData.targetColumn = targetColumn;
            currentJobData.metricThreshold = metricThreshold ? parseFloat(metricThreshold) : null;
            currentJobData.experimentTimeout = experimentTimeout ? parseInt(experimentTimeout) : null;
            return true;
            
        case 4:
            // Compute step - validate compute type selection
            const computeType = document.getElementById('compute-type').value;
            
            if (!computeType) {
                alert('Please select a compute type.');
                return false;
            }
            
            currentJobData.computeType = computeType;
            return true;
            
        case 5:
            // Review step - all validations done
            return true;
            
        default:
            return true;
    }
}

// Custom dropdown functionality
function toggleTaskTypeDropdown() {
    const dropdown = document.getElementById('task-type-options');
    const selected = document.getElementById('task-type-selected');
    
    const isExpanded = dropdown.classList.contains('show');
    dropdown.classList.toggle('show');
    selected.classList.toggle('active');
    
    // Update aria-expanded attribute
    selected.setAttribute('aria-expanded', !isExpanded);
    
    // Announce to screen readers
    if (!isExpanded) {
        announceToScreenReader('Task type dropdown opened');
    } else {
        announceToScreenReader('Task type dropdown closed');
    }
}

function selectTaskType(value) {
    const hiddenInput = document.getElementById('task-type');
    const selected = document.getElementById('task-type-selected');
    const dropdown = document.getElementById('task-type-options');
    const options = document.querySelectorAll('.task-type-option');
    
    // Update hidden input value
    hiddenInput.value = value;
    
    // Update selected display
    const selectedOption = document.querySelector(`[data-value="${value}"]`);
    const icon = selectedOption.querySelector('.task-type-icon').cloneNode(true);
    const text = selectedOption.querySelector('span').textContent;
    
    // Announce selection to screen readers
    announceToScreenReader(`Task type selected: ${text}`);
    
    selected.innerHTML = `
        <div class="selected-option">
            ${icon.outerHTML}
            <span>${text}</span>
        </div>
        <span class="dropdown-arrow">▼</span>
    `;
    
    // Update option states
    options.forEach(option => option.classList.remove('selected'));
    selectedOption.classList.add('selected');
    
    // Close dropdown
    dropdown.classList.remove('show');
    selected.classList.remove('active');
    
    // Call the update function
    updateTaskType(value);
    
    // Validate step after task type selection
    validateWizardStep();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.custom-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        document.getElementById('task-type-options').classList.remove('show');
        document.getElementById('task-type-selected').classList.remove('active');
    }
});

// Wizard validation functions
function validateWizardStep() {
    const nextBtn = document.getElementById('next-btn');
    let isValid = false;
    
    switch (currentStep) {
        case 1:
            // Basic settings - just need job name
            const jobName = document.getElementById('job-name').value.trim();
            isValid = jobName.length > 0;
            break;
            
        case 2:
            // Task type and data - need both task type and dataset
            const taskType = document.getElementById('task-type').value;
            const hasDataset = currentData && currentData.isSaved;
            isValid = taskType && hasDataset;
            break;
            
        case 3:
            // Task settings - need target column
            const targetColumn = document.getElementById('target-column').value;
            isValid = targetColumn && targetColumn !== '';
            break;
            
        default:
            // For other steps, allow progression
            isValid = true;
            break;
    }
    
    // Enable/disable Next button
    if (nextBtn) {
        nextBtn.disabled = !isValid;
        if (isValid) {
            nextBtn.classList.remove('disabled');
        } else {
            nextBtn.classList.add('disabled');
        }
    }
}

// File upload handling
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a valid CSV file.');
        input.value = '';
        return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('File is too large. Please select a CSV file smaller than 10MB.');
        input.value = '';
        return;
    }
    
    // Allow multiple datasets from the same file with different custom names
    // The unique validation will be handled by the custom name check during save
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        
        // Basic validation of CSV content
        if (!csvContent || csvContent.trim().length === 0) {
            alert('The CSV file appears to be empty.');
            input.value = '';
            return;
        }
        
        // Check if it looks like CSV (has commas or line breaks)
        if (!csvContent.includes(',') && !csvContent.includes('\n')) {
            alert('The file does not appear to be a valid CSV format.');
            input.value = '';
            return;
        }
        
        parseCSVData(csvContent, file.name);
        
        // Disable the file input after successful upload
        input.disabled = true;
    };
    
    reader.onerror = function() {
        alert('Error reading the file. Please try again.');
        input.value = '';
    };
    
    reader.readAsText(file);
}

function parseCSVData(csvContent, fileName) {
    try {
        console.log('Starting CSV parsing for:', fileName);
        
        // Check if PyScript is available
        if (!pyScriptReady) {
            console.log('PyScript not ready, using fallback parser');
            // Use fallback JavaScript CSV parsing
            const useHeaders = useFirstRowAsHeaders;
            try {
                const fallbackData = parseCSVFallback(csvContent, fileName, useHeaders);
                if (fallbackData) {
                    console.log('Fallback parsing successful:', fallbackData);
                    handleParsedData(JSON.stringify(fallbackData));
                } else {
                    throw new Error('Fallback parser returned null');
                }
            } catch (fallbackError) {
                console.error('Fallback parsing failed:', fallbackError);
                // Even fallback failed, create error data
                const errorData = {
                    success: false,
                    error: `Unable to parse CSV file: ${fallbackError.message}`,
                    filename: fileName,
                    columns: [],
                    parser: 'failed'
                };
                handleParsedData(JSON.stringify(errorData));
            }
            return;
        }

        // Try PyScript parsing with proper error handling
        try {
            console.log('Attempting PyScript CSV parsing...');
            // Store data in window for PyScript access
            window.csvContentForParsing = csvContent;
            window.fileNameForParsing = fileName;

            // Call PyScript function if available
            if (typeof window.parse_csv_with_pyscript === 'function') {
                console.log('Calling PyScript CSV parser...');
                // Use the global variable to determine header behavior
                const useHeaders = useFirstRowAsHeaders;
                console.log('Using first row as headers:', useHeaders);
                window.parse_csv_with_pyscript(csvContent, fileName, useHeaders);
                return;
            } else {
                console.log('PyScript CSV parser not available, using fallback');
                throw new Error('PyScript CSV parser not available');
            }
        } catch (pyScriptError) {
            console.log('PyScript parsing failed, using fallback:', pyScriptError.message);
            // Use fallback JavaScript CSV parsing
            const useHeaders = useFirstRowAsHeaders;
            const fallbackData = parseCSVFallback(csvContent, fileName, useHeaders);
            if (fallbackData) {
                console.log('Fallback parsing successful:', fallbackData);
                handleParsedData(JSON.stringify(fallbackData));
            } else {
                console.error('Both PyScript and fallback parsing failed');
                // Create error data structure and still show the interface
                const errorData = {
                    success: false,
                    error: 'Unable to parse CSV file. Please check the file format and try again.',
                    filename: fileName,
                    columns: [],
                    parser: 'failed'
                };
                handleParsedData(JSON.stringify(errorData));
            }
            return;
        }

        // Store file data for Data page
        const fileData = {
            id: Date.now(),
            name: fileName,
            content: csvContent,
            uploadTime: new Date(),
            size: csvContent.length
        };
        
        // Add to uploaded files if not already exists
        if (!uploadedDataFiles.find(f => f.name === fileName)) {
            uploadedDataFiles.push(fileData);
        }
        
    } catch (error) {
        console.error('Error parsing CSV:', error);
        alert(`Error parsing CSV file: ${error.message}. Please check the file format.`);
        
        // Try fallback JavaScript CSV parsing
        try {
            const useHeaders = useFirstRowAsHeaders;
            const fallbackData = parseCSVFallback(csvContent, fileName, useHeaders);
            if (fallbackData) {
                handleParsedData(JSON.stringify(fallbackData));
                return;
            }
        } catch (fallbackError) {
            console.error('Fallback parsing also failed:', fallbackError);
        }
        
        // Clear the file input on error
        document.getElementById('data-file').value = '';
    }
}

// Fallback CSV parser using JavaScript
function parseCSVFallback(csvContent, fileName, useFirstRowAsHeaders = true) {
    console.log('Starting parseCSVFallback with:', { fileName, useFirstRowAsHeaders });
    
    try {
        const lines = csvContent.trim().split('\n');
        console.log('Split CSV into lines:', lines.length);
        
        if (lines.length < 1) {
            throw new Error('CSV must have at least one row');
        }
        
        let headers;
        let dataStartIndex;
        
        console.log('Processing headers...');
        
        if (useFirstRowAsHeaders) {
            // Use first row as headers (original behavior)
            if (lines.length < 2) {
                throw new Error('CSV must have at least a header and one data row');
            }
            
            console.log('Parsing first line as headers:', lines[0]);
            headers = parseCSVLine(lines[0]);
            console.log('Parsed headers:', headers);
            
            if (!headers || !Array.isArray(headers)) {
                throw new Error('Failed to parse headers from first line');
            }
            
            dataStartIndex = 1;
            
            // Validate headers
            const headerValidation = validateCSVHeaders(headers, lines);
            if (!headerValidation.valid) {
                return {
                    success: false,
                    needsHeaders: true,
                    error: headerValidation.reason,
                    filename: fileName,
                    parser: 'javascript',
                    rawData: lines.slice(0, 4), // First 4 rows for preview
                    suggestedHeaders: headerValidation.suggestedHeaders
                };
            }
        } else {
            // Generate column headers, treat first row as data
            const firstRowCells = parseCSVLine(lines[0]);
            if (!firstRowCells || !Array.isArray(firstRowCells)) {
                throw new Error('Failed to parse first row for column detection');
            }
            headers = firstRowCells.map((_, index) => `Column${index + 1}`);
            dataStartIndex = 0;
        }
        
        console.log('Final headers:', headers);
        console.log('Data start index:', dataStartIndex);
        
        // Parse a few sample rows to determine data types
        const sampleRows = lines.slice(dataStartIndex, Math.min(dataStartIndex + 10, lines.length));
        console.log('Sample rows for type detection:', sampleRows.length);
        
        const dtypes = {};
        
        // Safety check - ensure headers is an array
        if (!Array.isArray(headers) || headers.length === 0) {
            throw new Error('Failed to parse CSV headers');
        }
        
        console.log('Starting type detection...');
        
        headers.forEach((header, index) => {
            console.log(`Processing header ${index}: ${header}`);
            
            // Improved type detection - check more samples and handle edge cases
            let isNumeric = true;
            let hasDecimals = false;
            let validValues = 0;
            
            for (let rowIndex = 0; rowIndex < sampleRows.length; rowIndex++) {
                const row = sampleRows[rowIndex];
                console.log(`  Checking row ${rowIndex}: ${row.substring(0, 50)}...`);
                
                try {
                    const cells = parseCSVLine(row);
                    console.log(`  Parsed cells:`, cells);
                    
                    if (!cells || !Array.isArray(cells) || index >= cells.length) {
                        console.log(`  Skipping row - malformed or incomplete`);
                        continue; // Skip malformed or incomplete rows
                    }
                    
                    const value = cells[index].trim();
                    if (value && value !== '' && value.toLowerCase() !== 'nan' && value.toLowerCase() !== 'null') {
                        validValues++;
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) {
                            isNumeric = false;
                            break;
                        } else {
                            if (value.includes('.') || value.includes('e') || value.includes('E')) {
                                hasDecimals = true;
                            }
                        }
                    }
                } catch (rowError) {
                    console.warn('Error parsing row for type detection:', rowError);
                    continue; // Skip problematic rows
                }
            }
            
            // Only consider it numeric if we have enough valid values to determine
            if (isNumeric && validValues > 0) {
                dtypes[header] = hasDecimals ? 'float64' : 'int64';
            } else {
                dtypes[header] = 'object';
            }
        });
        
        // Create preview data (first 5 data rows)
        const previewRows = lines.slice(dataStartIndex, Math.min(dataStartIndex + 5, lines.length));
        const preview = previewRows.map(row => {
            const cells = parseCSVLine(row);
            const rowObj = {};
            
            if (!cells || !Array.isArray(cells)) {
                // Return empty row if parsing failed
                headers.forEach(header => {
                    rowObj[header] = '';
                });
                return rowObj;
            }
            
            headers.forEach((header, index) => {
                let value = index < cells.length ? cells[index] : '';
                // Handle empty values and potential NaN-like strings
                if (value === '' || value.toLowerCase() === 'nan' || value.toLowerCase() === 'null') {
                    value = '';
                }
                rowObj[header] = value;
            });
            return rowObj;
        });
        
        return {
            columns: headers,
            dtypes: dtypes,
            shape: [lines.length - dataStartIndex, headers.length],
            filename: fileName,
            preview: preview,
            success: true,
            parser: 'javascript'
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            filename: fileName,
            parser: 'javascript'
        };
    }
}

// Validate CSV headers
function validateCSVHeaders(headers, lines) {
    // Safety check for headers
    if (!headers || !Array.isArray(headers)) {
        return {
            valid: false,
            reason: 'Invalid headers provided',
            suggestedHeaders: ['Column_1']
        };
    }
    
    // Check for empty or missing headers
    const hasEmptyHeaders = headers.some(h => !h || h.trim() === '');
    
    // Check if headers look like data (all numbers)
    const allNumeric = headers.every(h => !isNaN(parseFloat(h.trim())) && h.trim() !== '');
    
    // Check for generic headers like "Column1", "Field1", etc.
    const hasGenericHeaders = headers.some(h => 
        /^(column|field|col|var)\s*\d*$/i.test(h.trim())
    );
    
    // Check if first row looks like data compared to second row
    let firstRowLooksLikeData = false;
    if (lines && lines.length > 1) {
        try {
            const firstRow = parseCSVLine(lines[0]);
            const secondRow = parseCSVLine(lines[1]);
            
            // Safety check - ensure both rows are arrays
            if (Array.isArray(firstRow) && Array.isArray(secondRow)) {
                // If first row has more numbers than text, and similar pattern to second row
                const firstRowNumbers = firstRow.filter(cell => !isNaN(parseFloat(cell.trim()))).length;
                const secondRowNumbers = secondRow.filter(cell => !isNaN(parseFloat(cell.trim()))).length;
                
                if (firstRowNumbers > firstRow.length * 0.7 && Math.abs(firstRowNumbers - secondRowNumbers) <= 1) {
                    firstRowLooksLikeData = true;
                }
            }
        } catch (error) {
            console.warn('Error comparing rows for validation:', error);
            // Continue with validation even if row comparison fails
        }
    }
    
    let reason = '';
    let suggestedHeaders = [];
    
    if (hasEmptyHeaders) {
        reason = 'Some column headers are empty or missing';
    } else if (allNumeric) {
        reason = 'Column headers appear to be numeric data rather than descriptive names';
    } else if (firstRowLooksLikeData) {
        reason = 'First row appears to contain data rather than column headers';
    } else if (hasGenericHeaders) {
        reason = 'Column headers appear to be generic placeholders';
    }
    
    if (reason) {
        // Generate suggested headers
        for (let i = 0; i < headers.length; i++) {
            suggestedHeaders.push(`Column_${i + 1}`);
        }
        
        return {
            valid: false,
            reason: reason,
            suggestedHeaders: suggestedHeaders
        };
    }
    
    return { valid: true };
}

// Helper function to parse a CSV line handling quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result.map(cell => cell.replace(/^"|"$/g, '')); // Remove surrounding quotes
}

function handleParsedData(columnDataJson) {
    const columnData = JSON.parse(columnDataJson);
    
    // Check if header validation is needed
    if (!columnData.success && columnData.needsHeaders) {
        showHeaderValidationInterface(columnData);
        return;
    }
    
    // Always set currentData so we can show the file interface
    currentData = columnData;
    
    // Reset saved state for new data
    currentData.isSaved = false;
    isDataSaved = false;
    
    // Check if parsing was successful
    if (!columnData.success) {
        console.log(`Parsing failed: ${columnData.error}`);
        // Still display the file interface with error message and header options
        displayUploadedFile(columnData.filename || 'uploaded file');
        return;
    }

    // Initialize selected columns with all columns by default
    initializeSelectedColumns(columnData.columns);

    // Update target column dropdown with the actual columns
    updateTargetColumnDropdown(columnData.columns || []);

    document.getElementById('target-column-group').style.display = 'block';
    
    // Add change event listener to target column dropdown for validation
    const targetSelect = document.getElementById('target-column');
    targetSelect.addEventListener('change', validateWizardStep);
    
    console.log('Target column dropdown populated. Options:', Array.from(targetSelect.options).map(opt => opt.value));
    
    // Show success message with file info
    const rows = columnData.shape[0];
    const cols = columnData.shape[1];
    const parser = columnData.parser || 'unknown';
    console.log(`Successfully loaded ${columnData.filename}: ${rows} rows, ${cols} columns (using ${parser} parser)`);
    
    // Display the uploaded file with data preview now that parsing is complete
    displayUploadedFile(columnData.filename);
    
    // Update wizard button states since we have new data that isn't saved yet
    updateWizardStep();
}

function displayUploadedFile(fileName) {
    const uploadedFilesDiv = document.getElementById('uploaded-files');
    
    // Basic uploaded file display
    let fileDisplay = `
        <div class="uploaded-file">
            <span>📄 ${fileName}</span>
            <button type="button" onclick="removeUploadedFile()" style="margin-left: 10px; color: #d13438;">✕</button>
        </div>
    `;
    
    // Always add header validation interface for CSV files
    if (currentData) {
        console.log('Displaying file interface for:', currentData);
        
        const hasValidData = currentData.success && currentData.preview && currentData.preview.length > 0;
        const columns = currentData.columns || [];
        const previewRows = hasValidData ? currentData.preview.slice(0, 3) : [];
        
        fileDisplay += `
            <div class="data-preview" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; border: 1px solid #e1e4e8;">
                ${hasValidData ? `
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                        Data Preview (${currentData.shape ? currentData.shape[0] : 0} rows, ${currentData.shape ? currentData.shape[1] : 0} columns)
                    </div>
                ` : `
                    <div style="font-size: 12px; color: #d73a49; margin-bottom: 8px;">
                        ${currentData.error ? `Parse Error: ${currentData.error}` : 'File uploaded - configure headers below'}
                    </div>
                `}
                
                <!-- Custom headers input -->
                <div id="custom-headers-section" style="${hasValidData ? 'display: none;' : 'display: block;'} margin-bottom: 15px; padding: 10px; background: #fff; border: 1px solid #ddd; border-radius: 4px;">
                    <div style="font-size: 11px; color: #666; margin-bottom: 5px;">Enter column names:</div>
                    <div id="header-inputs" style="display: flex; gap: 8px; flex-wrap: wrap;">
                        ${columns.length > 0 ? columns.map((col, index) => `
                            <input type="text" 
                                   id="custom-header-${index}" 
                                   value="${hasValidData ? col : `Column${index + 1}`}" 
                                   placeholder="Column ${index + 1}"
                                   style="flex: 1; min-width: 80px; padding: 4px; border: 1px solid #ccc; border-radius: 3px; font-size: 11px;"
                                   onchange="updateCustomHeaders()"
                                   ${currentData.isSaved ? 'disabled' : ''}>
                        `).join('') : `
                            <div style="color: #666; font-size: 11px;">
                                Please ensure the file is a valid CSV format to detect columns.
                                <br><button onclick="retryParsing()" style="margin-top: 5px; padding: 4px 8px; font-size: 11px;">Retry Parsing</button>
                            </div>
                        `}
                    </div>
                </div>
                
                ${hasValidData ? `
                    <!-- Header checkbox - positioned above table, aligned left -->
                    <div style="margin-bottom: 10px;">
                        <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; white-space: nowrap;">
                            <input type="checkbox" id="first-row-headers" ${useFirstRowAsHeaders ? 'checked' : ''} onchange="toggleHeaderMode()" style="margin: 0;" ${currentData.isSaved ? 'disabled' : ''}>
                            <span>First row contains column headers</span>
                        </label>
                    </div>
                    
                    <div style="overflow-x: auto; max-width: 100%;">
                        <table id="data-preview-table" style="border-collapse: collapse; font-size: 11px; min-width: 100%;">
                            <thead>
                                <!-- Column selection row -->
                                <tr id="column-selection-row">
                                    ${columns.map(col => `
                                        <th style="padding: 4px 8px; border: 1px solid #ddd; background: #e8f4fd; text-align: center;">
                                            <label style="display: flex; align-items: center; justify-content: center; gap: 4px; cursor: pointer; font-size: 10px; font-weight: normal;">
                                                <input type="checkbox" 
                                                       id="col-${col}" 
                                                       class="column-checkbox" 
                                                       data-column="${col}" 
                                                       onchange="toggleColumnSelection('${col}')" 
                                                       checked 
                                                       style="margin: 0; scale: 0.8;">
                                                <span style="white-space: nowrap;">Include</span>
                                            </label>
                                        </th>
                                    `).join('')}
                                </tr>
                                <!-- Header row -->
                                <tr id="header-row">
                                    ${columns.map(col => `<th style="padding: 6px 8px; border: 1px solid #ddd; background: #f1f3f4; text-align: left; white-space: nowrap; font-weight: 600;">${col}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${previewRows.map(row => `
                                    <tr>
                                        ${columns.map(col => {
                                            let value = row[col];
                                            if (value === null || value === undefined) {
                                                value = '';
                                            } else {
                                                value = String(value);
                                            }
                                            // Truncate very long values but show more characters
                                            if (value.length > 30) {
                                                value = value.substring(0, 27) + '...';
                                            }
                                            return `<td style="padding: 6px 8px; border: 1px solid #ddd; white-space: nowrap; max-width: 200px;">${value}</td>`;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Create button positioned under right edge of table -->
                    <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                        <button type="button" id="save-data-btn" onclick="saveDataset()" 
                                style="padding: 8px 16px; font-size: 12px; background: #0366d6; color: white; border: none; border-radius: 4px; cursor: pointer; ${currentData.isSaved ? 'background: #28a745;' : ''}" 
                                ${currentData.isSaved ? 'disabled' : ''}>
                            ${currentData.isSaved ? '✓ Created' : 'Create'}
                        </button>
                    </div>
                ` : `
                    <!-- Header checkbox - positioned above placeholder, aligned left -->
                    <div style="margin-bottom: 10px;">
                        <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; white-space: nowrap;">
                            <input type="checkbox" id="first-row-headers" ${useFirstRowAsHeaders ? 'checked' : ''} onchange="toggleHeaderMode()" style="margin: 0;">
                            <span>First row contains column headers</span>
                        </label>
                    </div>
                    
                    <div style="padding: 20px; text-align: center; background: #f8f9fa; border: 1px dashed #ddd; border-radius: 4px;">
                        <div style="color: #666; font-size: 12px;">
                            Data preview will appear here once parsing is successful.
                            <br>Configure headers above and click "Retry Parsing" if needed.
                        </div>
                    </div>
                `}
            </div>
        `;
    } else {
        console.log('No data available for preview');
    }
    
    uploadedFilesDiv.innerHTML = fileDisplay;
    
    // Check if we have valid data
    const hasValidData = currentData && currentData.success && currentData.preview && currentData.preview.length > 0;
    
    console.log('Display file called with currentData:', currentData);
    console.log('Has valid data:', hasValidData);
    console.log('Columns:', currentData?.columns || 'No columns');
    
    // Auto-scroll to show the table area after file upload
    if (currentData && currentData.success && currentData.preview && currentData.preview.length > 0) {
        setTimeout(() => {
            const tableElement = document.getElementById('data-preview-table');
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            // Initialize the select all checkbox state
            updateSelectAllCheckbox();
            
            // Debug: Check if checkboxes exist
            console.log('Checking for checkboxes...');
            console.log('Select all checkbox:', document.getElementById('select-all-columns'));
            console.log('First column checkbox:', document.getElementById('col-select-0'));
        }, 100); // Small delay to ensure DOM is updated
    }
}

function removeUploadedFile() {
    document.getElementById('uploaded-files').innerHTML = '';
    const fileInput = document.getElementById('data-file');
    fileInput.value = '';
    fileInput.disabled = false; // Re-enable the file input
    document.getElementById('target-column-group').style.display = 'none';
    currentData = null;
    selectedColumns.clear(); // Clear column selections
}

// Header management functions
function toggleHeaderMode() {
    const checkbox = document.getElementById('first-row-headers');
    const customHeadersSection = document.getElementById('custom-headers-section');
    const headerRow = document.getElementById('header-row');
    
    if (!checkbox || !customHeadersSection || !currentData) return;
    
    // If data is already saved, don't allow changes
    if (currentData.isSaved) {
        checkbox.checked = !checkbox.checked; // Revert the change
        alert('Dataset is already saved. To make changes, please remove and re-upload the file.');
        return;
    }
    
    // Update the global variable to track user preference
    useFirstRowAsHeaders = checkbox.checked;
    
    if (checkbox.checked) {
        // Use first row as headers - restore original headers
        customHeadersSection.style.display = 'none';
        if (currentData.originalColumns) {
            // Restore original data structure
            currentData.columns = [...currentData.originalColumns];
            currentData.usingCustomHeaders = false;
            delete currentData.customHeaders;
            
            // Restore original preview data
            if (currentData.preview && currentData.originalColumns) {
                // Re-parse or request fresh data - for now just update display
                console.log('Restored to original headers:', currentData.originalColumns);
            }
        }
        updatePreviewTableHeaders(currentData.columns);
        
        // Trigger a reparse to get the original data structure back
        retryParsing();
    } else {
        // Show custom header inputs and trigger reparse with first row as data
        customHeadersSection.style.display = 'block';
        
        // Trigger reparse
        retryParsing();
    }
}

function updateCustomHeaders() {
    if (!currentData) return;
    
    // Prevent changes if data is already saved
    if (currentData.isSaved) {
        return;
    }
    
    const customHeaders = [];
    const numColumns = currentData.columns.length;
    
    // Get values from custom header inputs
    for (let i = 0; i < numColumns; i++) {
        const input = document.getElementById(`custom-header-${i}`);
        if (input) {
            const value = input.value.trim();
            customHeaders.push(value || `Column${i + 1}`);
        } else {
            customHeaders.push(`Column${i + 1}`);
        }
    }
    
    // Update the preview table headers
    updatePreviewTableHeaders(customHeaders);
    
    // Update currentData with new headers for processing
    const checkbox = document.getElementById('first-row-headers');
    if (checkbox && !checkbox.checked) {
        // Store the original columns and create a mapping
        if (!currentData.originalColumns) {
            currentData.originalColumns = [...currentData.columns];
        }
        
        // Update columns in currentData
        currentData.columns = [...customHeaders];
        currentData.customHeaders = customHeaders;
        currentData.usingCustomHeaders = true;
        
        // Update the preview data to use new headers
        if (currentData.preview) {
            // When using custom headers, we need to treat the first row as data, not headers
            // So we need to get the raw data and reprocess it
            const originalFirstRowAsData = {};
            
            // If we have original columns, create a data row from the first row that was treated as headers
            if (currentData.originalColumns) {
                currentData.originalColumns.forEach((originalCol, index) => {
                    originalFirstRowAsData[customHeaders[index]] = originalCol; // The original "header" becomes data
                });
            }
            
            // Map existing preview data to new headers
            const mappedPreviewData = currentData.preview.map(row => {
                const newRow = {};
                currentData.originalColumns.forEach((oldCol, index) => {
                    newRow[customHeaders[index]] = row[oldCol];
                });
                return newRow;
            });
            
            // Prepend the original first row as data when using custom headers
            currentData.preview = [originalFirstRowAsData, ...mappedPreviewData];
            
            // Update the display immediately
            displayUploadedFile(currentData.filename);
        }
        
        // Update dtypes mapping
        if (currentData.dtypes) {
            const newDtypes = {};
            currentData.originalColumns.forEach((oldCol, index) => {
                newDtypes[customHeaders[index]] = currentData.dtypes[oldCol];
            });
            currentData.dtypes = newDtypes;
        }
        
        console.log('Updated currentData with custom headers:', currentData);
    }
    
    // Validate wizard step after file display to enable Next button if conditions are met
    validateWizardStep();
}

function saveDataset() {
    if (!currentData || !currentData.success) {
        alert('No valid dataset to save');
        return;
    }
    
    // Check if at least one column is selected
    const selectedCols = getSelectedColumns();
    if (selectedCols.length === 0) {
        alert('Please select at least one column to include in the dataset.');
        return;
    }
    
    // Validate dataset name
    const datasetNameInput = document.getElementById('dataset-name');
    const customName = datasetNameInput ? datasetNameInput.value.trim() : '';
    
    if (!customName) {
        alert('Please provide a dataset name.');
        return;
    }
    
    if (!validateDatasetName()) {
        alert('Please provide a valid, unique dataset name.');
        return;
    }
    
    // Use custom name if provided, otherwise use filename
    const datasetName = customName || currentData.filename;
    
    // Get filtered data with only selected columns
    const filteredData = getFilteredData();
    if (!filteredData) {
        alert('Error creating filtered dataset');
        return;
    }
    
    // Create a finalized copy of the current data with only selected columns
    const finalizedData = {
        ...filteredData,
        isSaved: true,
        savedAt: new Date().toISOString(),
        uploadTime: new Date(), // Add uploadTime for data list compatibility
        finalColumns: [...selectedCols],
        finalHeaders: currentData.usingCustomHeaders ? 
            selectedCols.map(col => {
                const index = currentData.columns.indexOf(col);
                return currentData.customHeaders ? currentData.customHeaders[index] : col;
            }) : [...selectedCols],
        name: datasetName, // Use the custom name or filename
        customName: customName, // Store the custom name separately
        filename: currentData.filename, // Keep original filename
        selectedColumns: [...selectedCols], // Store which columns were selected
        originalColumns: [...currentData.columns] // Store original columns for reference
    };
    
    // Update the uploadedDataFiles array with the finalized data
    // Only update if the exact same custom name exists, otherwise create new
    const existingIndex = uploadedDataFiles.findIndex(f => 
        f.customName && f.customName === customName
    );
    if (existingIndex >= 0) {
        uploadedDataFiles[existingIndex] = finalizedData;
    } else {
        uploadedDataFiles.push(finalizedData);
    }
    
    // Filter the PyScript DataFrame to only include selected columns
    if (typeof window.filter_dataframe_columns === 'function') {
        console.log('Filtering PyScript DataFrame to selected columns:', selectedCols);
        const filterSuccess = window.filter_dataframe_columns(selectedCols);
        if (!filterSuccess) {
            console.warn('Failed to filter PyScript DataFrame, but continuing with dataset creation');
        } else {
            console.log('✓ PyScript DataFrame filtered successfully');
        }
    } else {
        console.warn('filter_dataframe_columns function not available');
    }
    
    // Mark current data as saved
    currentData.isSaved = true;
    isDataSaved = true;
    
    // Update the UI to reflect saved state
    displayUploadedFile(currentData.filename);
    
    // Validate wizard step after data is saved
    validateWizardStep();
    
    // Update the data page to show this dataset
    updateDataFilesList();
    
    // Also update the dataset list in the wizard
    populateDatasetList();
    
    // Hide the file upload form after saving
    document.getElementById('file-upload-group').style.display = 'none';
    
    // Automatically select the newly created dataset in the list
    setTimeout(() => {
        const radioButton = document.querySelector(`input[name="selected-dataset"][value="${datasetName}"]`);
        if (radioButton) {
            radioButton.checked = true;
            // Trigger the onchange event to set it as current data
            selectExistingDataset(datasetName);
        }
        
        // Scroll up to show the dataset list after creation
        const datasetListElement = document.getElementById('dataset-list');
        if (datasetListElement) {
            datasetListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 200); // Slightly longer delay to ensure all UI updates are complete
    
    console.log('Dataset saved successfully:', finalizedData);
}

function updatePreviewTableHeaders(headers) {
    const headerRow = document.getElementById('header-row');
    if (!headerRow) return;
    
    headerRow.innerHTML = headers.map(header => 
        `<th style="padding: 6px 8px; border: 1px solid #ddd; background: #f1f3f4; text-align: left; white-space: nowrap; font-weight: 600;">${header}</th>`
    ).join('');
    
    // Also update the target column dropdown if visible
    updateTargetColumnDropdown(headers);
}

function updateTargetColumnDropdown(headers) {
    const targetSelect = document.getElementById('target-column');
    if (!targetSelect || !currentData) return;
    
    // Save current selection
    const currentSelection = targetSelect.value;
    
    // Update options
    targetSelect.innerHTML = '<option value="">Select target column</option>';
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        targetSelect.appendChild(option);
    });
    
    // Restore selection if it still exists
    if (currentSelection && headers.includes(currentSelection)) {
        targetSelect.value = currentSelection;
    }
}

function retryParsing() {
    // Get the current file
    const fileInput = document.getElementById('data-file');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('No file selected. Please upload a CSV file first.');
        return;
    }
    
    const file = fileInput.files[0];
    console.log('Retrying parsing for file:', file.name);
    
    // Re-read and parse the file
    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        parseCSVData(csvContent, file.name);
    };
    
    reader.onerror = function() {
        alert('Error reading the file. Please try again.');
    };
    
    reader.readAsText(file);
}

// Task type handling
function updateTaskType(taskType) {
    currentJobData.taskType = taskType;
    
    // Set default configuration based on task type if not already set
    if (!currentJobData.primaryMetric) {
        currentJobData.primaryMetric = taskType === 'classification' ? 'auc' : 'mae';
    }
    
    if (!currentJobData.algorithms) {
        currentJobData.algorithms = taskType === 'classification' 
            ? ['logistic_regression', 'decision_tree', 'random_forest']
            : ['linear_regression', 'decision_tree', 'lasso'];
    }
    
    if (currentJobData.normalizeFeatures === undefined) {
        currentJobData.normalizeFeatures = false;
    }
    
    if (!currentJobData.missingDataStrategy) {
        currentJobData.missingDataStrategy = 'remove';
    }
    
    if (!currentJobData.categoricalSettings) {
        currentJobData.categoricalSettings = {};
    }
    
    // Update metric threshold constraints based on task type's default metric
    updateMetricThresholdConstraints(currentJobData.primaryMetric);
    
    console.log('Updated currentJobData with task type defaults:', currentJobData);
    
    // Update categorical columns display if data is loaded
    if (currentData) {
        updateCategoricalColumnsDisplay();
    }
}

function updateCategoricalColumnsDisplay() {
    if (!currentData) return;
    
    const categoricalDiv = document.getElementById('categorical-columns');
    const categoricalGroup = document.getElementById('categorical-columns-group');
    
    // Get selected columns
    const selectedCols = getSelectedColumns();
    
    // Find non-numeric columns from ONLY the selected columns
    const nonNumericColumns = [];
    Object.entries(currentData.dtypes).forEach(([column, dtype]) => {
        // Only include if column is in selected columns
        if (selectedCols.includes(column) && (dtype === 'object' || dtype.includes('string'))) {
            nonNumericColumns.push(column);
        }
    });
    
    if (nonNumericColumns.length > 0) {
        categoricalGroup.style.display = 'block';
        categoricalDiv.innerHTML = '';
        
        nonNumericColumns.forEach(column => {
            // Get saved value or use default
            const savedValue = currentJobData.categoricalSettings?.[column] || 'categorize';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="column-name">${column}</td>
                <td>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="categorical-${column}" value="categorize" ${savedValue === 'categorize' ? 'checked' : ''}>
                            <span>Categorize</span>
                        </label>
                        <label>
                            <input type="radio" name="categorical-${column}" value="ignore" ${savedValue === 'ignore' ? 'checked' : ''}>
                            <span>Ignore</span>
                        </label>
                    </div>
                </td>
            `;
            categoricalDiv.appendChild(row);
        });
    } else {
        categoricalGroup.style.display = 'none';
    }
}

// Configuration flyouts
function openConfigFlyout() {
    const taskType = currentJobData.taskType || document.querySelector('input[name="task-type"]:checked')?.value;
    
    if (!taskType) {
        alert('Please select a task type first.');
        return;
    }
    
    populateConfigModal(taskType);
    
    // Ensure the save button is enabled and clickable
    const saveBtn = document.getElementById('config-save-btn');
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.removeAttribute('disabled');
        
        // Remove any existing event listeners and add fresh one
        saveBtn.onclick = null;
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Save button clicked via event listener');
            saveConfig();
        });
        
        console.log('Config save button enabled and event listener added'); // Debug log
    }
    
    document.getElementById('config-flyout').classList.add('open');
    document.getElementById('flyout-overlay').classList.add('show');
}

function closeConfigFlyout() {
    document.getElementById('config-flyout').classList.remove('open');
    document.getElementById('flyout-overlay').classList.remove('show');
}

function populateConfigModal(taskType) {
    const metricSelect = document.getElementById('primary-metric');
    const algorithmsDiv = document.getElementById('algorithms-list');
    
    metricSelect.innerHTML = '';
    algorithmsDiv.innerHTML = '';
    
    // Get saved values from currentJobData or use defaults
    const savedPrimaryMetric = currentJobData.primaryMetric || (taskType === 'classification' ? 'auc' : 'mae');
    const savedAlgorithms = currentJobData.algorithms || (taskType === 'classification' 
        ? ['logistic_regression', 'decision_tree', 'random_forest']
        : ['linear_regression', 'decision_tree', 'lasso']);
    
    if (taskType === 'classification') {
        // Classification metrics
        ['auc', 'accuracy', 'precision', 'recall', 'f1'].forEach(metric => {
            const option = document.createElement('option');
            option.value = metric;
            option.textContent = metric === 'auc' ? 'AUC' : metric.charAt(0).toUpperCase() + metric.slice(1);
            option.selected = metric === savedPrimaryMetric;
            metricSelect.appendChild(option);
        });
        
        // Classification algorithms
        ['logistic_regression', 'decision_tree', 'random_forest'].forEach(algo => {
            const label = document.createElement('label');
            const isChecked = savedAlgorithms.includes(algo);
            label.innerHTML = `
                <input type="checkbox" value="${algo}" ${isChecked ? 'checked' : ''}>
                ${algo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            `;
            algorithmsDiv.appendChild(label);
        });
    } else {
        // Regression metrics
        ['mae', 'rmse', 'r2'].forEach(metric => {
            const option = document.createElement('option');
            option.value = metric;
            option.textContent = metric.toUpperCase();
            option.selected = metric === savedPrimaryMetric;
            metricSelect.appendChild(option);
        });
        
        // Regression algorithms
        ['linear_regression', 'decision_tree', 'lasso'].forEach(algo => {
            const label = document.createElement('label');
            const isChecked = savedAlgorithms.includes(algo);
            label.innerHTML = `
                <input type="checkbox" value="${algo}" ${isChecked ? 'checked' : ''}>
                ${algo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            `;
            algorithmsDiv.appendChild(label);
        });
    }
}

function saveConfig() {
    console.log('saveConfig() called'); // Debug log
    const primaryMetric = document.getElementById('primary-metric').value;
    const selectedAlgorithms = Array.from(document.querySelectorAll('#algorithms-list input:checked'))
        .map(cb => cb.value);
    
    console.log('Primary metric:', primaryMetric, 'Algorithms:', selectedAlgorithms); // Debug log
    
    currentJobData.primaryMetric = primaryMetric;
    currentJobData.algorithms = selectedAlgorithms;
    
    // Update metric threshold constraints based on selected primary metric
    updateMetricThresholdConstraints(primaryMetric);
    
    closeConfigFlyout();
}

// Featurization flyout
function openFeaturizationFlyout() {
    if (currentData) {
        // Clean up categorical settings to only include selected columns
        const selectedCols = getSelectedColumns();
        if (currentJobData.categoricalSettings) {
            const cleanedSettings = {};
            Object.keys(currentJobData.categoricalSettings).forEach(column => {
                if (selectedCols.includes(column)) {
                    cleanedSettings[column] = currentJobData.categoricalSettings[column];
                }
            });
            currentJobData.categoricalSettings = cleanedSettings;
        }
        
        updateCategoricalColumnsDisplay();
    }
    
    // Restore saved normalize features checkbox state
    const normalizeFeatures = currentJobData.normalizeFeatures !== undefined ? currentJobData.normalizeFeatures : false;
    const normalizeCheckbox = document.getElementById('normalize-features');
    if (normalizeCheckbox) {
        normalizeCheckbox.checked = normalizeFeatures;
    }
    
    // Restore saved missing data strategy
    const missingDataStrategy = currentJobData.missingDataStrategy || 'remove';
    const strategyRadio = document.querySelector(`input[name="missing-data-strategy"][value="${missingDataStrategy}"]`);
    if (strategyRadio) {
        strategyRadio.checked = true;
    }
    
    document.getElementById('featurization-flyout').classList.add('open');
    document.getElementById('flyout-overlay').classList.add('show');
}

function closeFeaturizationFlyout() {
    document.getElementById('featurization-flyout').classList.remove('open');
    document.getElementById('flyout-overlay').classList.remove('show');
}

function saveFeaturization() {
    const normalizeFeatures = document.getElementById('normalize-features').checked;
    currentJobData.normalizeFeatures = normalizeFeatures;
    
    // Save missing data strategy
    const missingDataStrategy = document.querySelector('input[name="missing-data-strategy"]:checked').value;
    currentJobData.missingDataStrategy = missingDataStrategy;
    
    // Save categorical column settings (only for selected columns)
    const selectedCols = getSelectedColumns();
    const categoricalSettings = {};
    document.querySelectorAll('#categorical-columns input:checked').forEach(radio => {
        const name = radio.name;
        const column = name.replace('categorical-', '');
        // Only save settings for selected columns
        if (selectedCols.includes(column)) {
            categoricalSettings[column] = radio.value;
        }
    });
    currentJobData.categoricalSettings = categoricalSettings;
    
    closeFeaturizationFlyout();
}

// Job summary
function updateJobSummary() {
    const summaryDiv = document.getElementById('job-summary');
    
    const config = {
        primaryMetric: currentJobData.primaryMetric || 'auc',
        algorithms: currentJobData.algorithms || ['logistic_regression', 'decision_tree', 'random_forest'],
        normalizeFeatures: currentJobData.normalizeFeatures || false,
        missingDataStrategy: currentJobData.missingDataStrategy || 'remove',
        categoricalSettings: currentJobData.categoricalSettings || {}
    };
    
    summaryDiv.innerHTML = `
        <div class="summary-section">
            <h4>Job Configuration</h4>
            <p><strong>Job Name:</strong> ${currentJobData.jobName}</p>
            <p><strong>Task Type:</strong> ${currentJobData.taskType}</p>
            <p><strong>Target Column:</strong> ${currentJobData.targetColumn}</p>
            <p><strong>Compute Type:</strong> ${currentJobData.computeType}</p>
            <p><strong>Primary Metric:</strong> ${config.primaryMetric}</p>
            <p><strong>Algorithms:</strong> ${config.algorithms.join(', ')}</p>
            <p><strong>Normalize Features:</strong> ${config.normalizeFeatures ? 'Yes' : 'No'}</p>
            <p><strong>Missing Data:</strong> ${config.missingDataStrategy === 'remove' ? 'Remove rows' : 'Fill missing values'}</p>
            ${Object.keys(config.categoricalSettings).length > 0 ? 
                `<p><strong>Categorical Columns:</strong> ${JSON.stringify(config.categoricalSettings)}</p>` : ''}
            ${currentJobData.metricThreshold ? 
                `<p><strong>Metric Score Threshold:</strong> ${currentJobData.metricThreshold}</p>` : ''}
            ${currentJobData.experimentTimeout ? 
                `<p><strong>Experiment Timeout:</strong> ${currentJobData.experimentTimeout} minutes</p>` : ''}
        </div>
    `;
}

// Job submission and training
function submitJob() {
    if (!validateCurrentStep()) return;
    
    // Capture ALL form data before wizard is closed and form is reset
    const capturedJobData = {
        jobName: document.getElementById('job-name').value.trim(),
        taskType: document.getElementById('task-type').value,
        targetColumn: document.getElementById('target-column') ? document.getElementById('target-column').value : null,
        computeType: document.getElementById('compute-type') ? document.getElementById('compute-type').value : null,
        metricThreshold: document.getElementById('metric-threshold') ? 
            (document.getElementById('metric-threshold').value ? parseFloat(document.getElementById('metric-threshold').value) : null) : null,
        experimentTimeout: document.getElementById('experiment-timeout') ? 
            (document.getElementById('experiment-timeout').value ? parseInt(document.getElementById('experiment-timeout').value) : null) : null,
        // Use currentJobData for configuration that was set through modals
        primaryMetric: currentJobData.primaryMetric,
        algorithms: currentJobData.algorithms,
        normalizeFeatures: currentJobData.normalizeFeatures,
        missingDataStrategy: currentJobData.missingDataStrategy,
        categoricalSettings: currentJobData.categoricalSettings
    };
    
    // Validate required fields
    if (!capturedJobData.jobName) {
        alert('Job name is missing. Please go back and enter a job name.');
        return;
    }
    
    if (!capturedJobData.taskType) {
        alert('Please select a task type before submitting the job.');
        return;
    }
    
    if (!capturedJobData.targetColumn) {
        alert('Please select a target column before submitting the job.');
        return;
    }
    
    if (!capturedJobData.computeType) {
        alert('Please select a compute type before submitting the job.');
        return;
    }
    
    // Additional validation for training requirements
    if (!currentData) {
        alert('No data available for training. Please upload a CSV file first.');
        return;
    }
    
    if (!pyScriptReady) {
        alert('PyScript libraries are still loading. Please wait for the libraries to finish loading and try again.');
        return;
    }
    
    console.log('Job submission validation passed:', capturedJobData);
    
    // Set default configuration if not already set in captured data
    if (!capturedJobData.primaryMetric) {
        capturedJobData.primaryMetric = capturedJobData.taskType === 'classification' ? 'auc' : 'mae';
    }
    if (!capturedJobData.algorithms) {
        capturedJobData.algorithms = capturedJobData.taskType === 'classification' 
            ? ['logistic_regression', 'decision_tree', 'random_forest']
            : ['linear_regression', 'decision_tree', 'lasso'];
    }
    if (capturedJobData.normalizeFeatures === undefined) {
        capturedJobData.normalizeFeatures = false;
    }
    if (!capturedJobData.missingDataStrategy) {
        capturedJobData.missingDataStrategy = 'remove';
    }
    if (!capturedJobData.categoricalSettings) {
        capturedJobData.categoricalSettings = {};
    }

    closeJobWizard();
    
    // Pass the complete captured job data to training
    startTrainingJob(capturedJobData);
}

function startTrainingJob(capturedJobData) {
    // Update currentJobData with all captured values
    currentJobData = { ...currentJobData, ...capturedJobData };
    
    console.log('Starting training job with complete data:', currentJobData);
    
    // Get the current dataset information for data guardrails
    let datasetInfo = null;
    
    // Debug: Log available data sources
    console.log('🔍 DEBUG: Looking for dataset info...');
    console.log('  currentData:', currentData);
    console.log('  uploadedDataFiles length:', uploadedDataFiles ? uploadedDataFiles.length : 0);
    
    // First, try to find the saved dataset that was actually used for this job
    if (uploadedDataFiles && uploadedDataFiles.length > 0) {
        // Look for saved datasets (isSaved = true) and use the most recent one
        const savedDatasets = uploadedDataFiles.filter(f => f.isSaved);
        if (savedDatasets.length > 0) {
            datasetInfo = { ...savedDatasets[savedDatasets.length - 1] };
            console.log('  ✓ Using saved dataset from uploadedDataFiles:', datasetInfo.customName || datasetInfo.filename);
        } else {
            // Fallback to the last uploaded file
            const lastFile = uploadedDataFiles[uploadedDataFiles.length - 1];
            if (lastFile && (lastFile.preview || lastFile.data || lastFile.columns)) {
                datasetInfo = { ...lastFile };
                console.log('  ✓ Using last uploaded file:', lastFile.name || lastFile.filename);
            }
        }
    }
    
    // If still no dataset info, try currentData as last resort
    if (!datasetInfo && currentData && (currentData.preview || currentData.data)) {
        datasetInfo = { ...currentData };
        console.log('  ✓ Using currentData as fallback');
    }
    
    console.log('  Final datasetInfo:', datasetInfo);

    // Add job to history
    const job = {
        id: Date.now(),
        name: currentJobData.jobName,
        status: 'running',
        taskType: currentJobData.taskType,
        targetColumn: currentJobData.targetColumn,
        computeType: currentJobData.computeType,
        startTime: new Date(),
        models: [],
        childJobs: [],
        // Store dataset information for data guardrails
        datasetInfo: datasetInfo,
        // Store all configuration settings
        primaryMetric: currentJobData.primaryMetric,
        algorithms: currentJobData.algorithms,
        normalizeFeatures: currentJobData.normalizeFeatures,
        missingDataStrategy: currentJobData.missingDataStrategy,
        categoricalSettings: currentJobData.categoricalSettings,
        metricThreshold: currentJobData.metricThreshold,
        experimentTimeout: currentJobData.experimentTimeout
    };
    
    // Create child jobs for each algorithm
    if (currentJobData.algorithms && currentJobData.algorithms.length > 0) {
        currentJobData.algorithms.forEach((algorithm, index) => {
            const childJob = {
                id: `${job.id}-child-${index + 1}`,
                displayName: `${job.name}-child${index + 1}`, // Use proper child job naming format
                parentJobId: job.id,
                parentJobName: job.name,
                algorithm: algorithm,
                computeType: currentJobData.computeType || 'Standard',
                status: 'Running',
                createdOn: new Date(),
                startTime: new Date(),
                // Inherit dataset information from parent job
                datasetInfo: datasetInfo,
                targetColumn: currentJobData.targetColumn
            };
            job.childJobs.push(childJob);
        });
    }
    
    jobHistory.push(job);
    
    // Increment counters for next job
    jobCounter++;
    
    refreshJobs();
    
    // Navigate to job details page instead of showing modal
    showJobDetails(job);
    
    // Start training with PyScript
    setTimeout(() => {
        trainModels(job);
    }, 1000);
}

function trainModels(job) {
    try {
        // Check if PyScript is ready
        if (!pyScriptReady) {
            throw new Error('PyScript ML libraries are still loading. Please wait and try again.');
        }

        // Check if PyScript training function is available
        if (typeof window.train_ml_models_pyscript !== 'function') {
            throw new Error('PyScript ML training function is not available. Please refresh the page.');
        }

        // Prepare job data for Python function
        const selectedCols = getSelectedColumns();
        const jobDataForPython = {
            ...currentJobData,
            id: job.id,
            jobName: job.name,
            selectedColumns: selectedCols  // Add selected columns to job data
        };

        console.log('DEBUG: jobDataForPython.targetColumn =', jobDataForPython.targetColumn);
        console.log('DEBUG: currentJobData.targetColumn =', currentJobData.targetColumn);
        console.log('DEBUG: selectedColumns =', selectedCols);

        // Validate required fields
        if (!jobDataForPython.targetColumn) {
            throw new Error('Target column is not set. Please go back and select a target column.');
        }
        
        if (!jobDataForPython.taskType) {
            throw new Error('Task type is not set. Please go back and select a task type.');
        }
        
        // Validate that target column is included in selected columns
        if (selectedCols.length === 0) {
            throw new Error('No columns selected. Please select at least one column to include in the dataset.');
        }
        
        if (!selectedCols.includes(jobDataForPython.targetColumn)) {
            throw new Error('Target column must be included in the selected columns. Please check your column selection.');
        }

        console.log('Starting PyScript ML training with real algorithms...');
        console.log('Training job data:', jobDataForPython);
        console.log('Current job data state:', currentJobData);
        console.log('🔍 CRITICAL SETTINGS CHECK:');
        console.log('  normalizeFeatures:', jobDataForPython.normalizeFeatures);
        console.log('  algorithms:', jobDataForPython.algorithms);
        console.log('  primaryMetric:', jobDataForPython.primaryMetric);
        console.log('  categoricalSettings:', jobDataForPython.categoricalSettings);

        // Apply custom headers to PyScript DataFrame if needed
        if (currentData && currentData.usingCustomHeaders && currentData.customHeaders) {
            console.log('Applying custom headers to PyScript DataFrame:', currentData.customHeaders);
            if (typeof window.update_dataframe_headers === 'function') {
                const success = window.update_dataframe_headers(currentData.customHeaders);
                if (!success) {
                    throw new Error('Failed to apply custom headers to DataFrame');
                }
            } else {
                console.warn('update_dataframe_headers function not available');
            }
        }

        // Use PyScript for real ML training - PyScript has the DataFrame stored globally
        window.train_ml_models_pyscript(JSON.stringify(jobDataForPython), {});

    } catch (error) {
        console.error('Training error:', error);
        document.getElementById('training-progress').innerHTML += 
            `<div class="progress-item error">✗ Training failed: ${error.message}</div>`;
    }
}

function updateTrainingProgress(progressHtml) {
    // Update both the old modal (for backwards compatibility) and new job details page
    const progressDiv = document.getElementById('training-progress');
    if (progressDiv) {
        progressDiv.innerHTML += progressHtml;
    }
    
    // Update job details progress section
    updateJobTrainingProgress(progressHtml);
}

function completeTraining(modelResults, jobId) {
    console.log('Completing training for job:', jobId, 'with results:', modelResults);
    
    // Get the job to access the primary metric
    const job = jobHistory.find(j => j.id === jobId);
    if (!job) {
        console.error('Job not found for ID:', jobId);
        return;
    }
    
    const primaryMetric = job.primaryMetric || 'auc';
    console.log('Using primary metric for best model selection:', primaryMetric);
    
    // modelResults should be an array from Python
    let modelArray = [];
    
    if (Array.isArray(modelResults)) {
        // Results come directly from Python as array
        console.log('🔍 DEBUG: Raw model results from Python:', modelResults);
        
        modelArray = modelResults.map(result => {
            const pythonPrimaryScore = result.primary_score;
            const calculatedScore = result.metrics[primaryMetric] ? result.metrics[primaryMetric].toFixed(4) : '0.0000';
            const finalScore = pythonPrimaryScore || calculatedScore;
            
            console.log(`🔍 DEBUG: Model ${result.name}:`);
            console.log(`  - Python primary_score: ${pythonPrimaryScore}`);
            console.log(`  - Calculated score: ${calculatedScore}`);
            console.log(`  - Final score used: ${finalScore}`);
            console.log(`  - Primary metric '${primaryMetric}' from metrics:`, result.metrics[primaryMetric]);
            console.log(`  - All metrics:`, result.metrics);
            
            return {
                name: result.display_name || result.name,
                primary_score: finalScore,
                metrics: result.metrics,
                is_best: result.is_best || false,
                created_at: result.created_at || new Date().toISOString()
            };
        });
    } else if (typeof modelResults === 'object') {
        // Handle legacy format (object) - convert object to array and find best model
        const higherIsBetter = isMetricHigherBetter(primaryMetric, job.taskType);
        let bestScore = higherIsBetter ? -Infinity : Infinity;
        let bestModelName = '';
        
        Object.entries(modelResults).forEach(([modelName, metrics]) => {
            const score = metrics.score || 0;
            const isBetter = higherIsBetter ? (score > bestScore) : (score < bestScore);
            if (isBetter) {
                bestScore = score;
                bestModelName = modelName;
            }
            
            modelArray.push({
                name: modelName,
                primary_score: score.toFixed(4),
                metrics: metrics,
                is_best: false, // Will be set below
                created_at: new Date().toISOString() // Add timestamp for legacy format
            });
        });
        
        // Mark the best model
        const bestModel = modelArray.find(m => m.name === bestModelName);
        if (bestModel) {
            bestModel.is_best = true;
        }
    }
    
    // Ensure correct best model selection if not already set by Python
    if (modelArray.length > 1) {
        const hasBestModel = modelArray.some(model => model.is_best);
        
        if (!hasBestModel) {
            console.log('🔍 No best model set by Python, determining best model...');
            const higherIsBetter = isMetricHigherBetter(primaryMetric, job.taskType);
            
            // Find the actual best model
            let bestModel = modelArray[0];
            let bestScore = parseFloat(bestModel.metrics[primaryMetric] || bestModel.primary_score || 0);
            
            modelArray.forEach(model => {
                const score = parseFloat(model.metrics[primaryMetric] || model.primary_score || 0);
                const isBetter = higherIsBetter ? (score > bestScore) : (score < bestScore);
                if (isBetter) {
                    bestScore = score;
                    bestModel = model;
                }
            });
            
            // Mark the correct best model
            bestModel.is_best = true;
            console.log(`🔍 Best model determined: ${bestModel.name} with ${primaryMetric}=${bestScore} (${higherIsBetter ? 'higher' : 'lower'} is better)`);
        } else {
            console.log('🔍 Best model already set by Python training');
        }
    } else if (modelArray.length === 1) {
        modelArray[0].is_best = true;
    }
    
    console.log('Processed model results:', modelArray);
    console.log('Primary metric being used:', primaryMetric);
    
    // Update job models and end time (status is already set by handleTrainingComplete)
    if (job) {
        console.log('Updating job models and end time for job:', jobId);
        job.models = modelArray;
        job.endTime = new Date();
        
        console.log('Job after update:', job);
        
        // Update current job details if this is the active job
        if (currentJobDetails && currentJobDetails.id === jobId) {
            console.log('Updating current job details');
            currentJobDetails = job;
            updateJobDetailsContent(job);
        } else {
            console.log('No active job details to update, currentJobDetails:', currentJobDetails);
        }
        
        // Force refresh the jobs list
        console.log('Calling refreshJobs()');
        refreshJobs();
    } else {
        console.error('Job object is null/undefined');
    }
    
    // Display model results in old modal (for backwards compatibility)
    const resultsDiv = document.getElementById('model-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = '<h4>Training Results:</h4>';
        
        modelArray.forEach(result => {
            const modelDiv = document.createElement('div');
            modelDiv.className = `model-result ${result.is_best ? 'best-model' : ''}`;
            modelDiv.onclick = () => showModelDetails(result);
            
            modelDiv.innerHTML = `
                <div class="model-header">
                    <span class="model-name">${result.name}${result.is_best ? ' (Best Model)' : ''}</span>
                    <span class="model-score">${result.primary_score}</span>
                </div>
                <div class="model-info">
                    Primary metric: ${Object.keys(result.metrics).join(', ')}
                </div>
            `;
            
            resultsDiv.appendChild(modelDiv);
        });
    }
    
    // Show close button in modal
    const closeBtn = document.getElementById('training-close-btn');
    if (closeBtn) {
        closeBtn.style.display = 'block';
    }
    
    // Update training progress in job details
    updateJobTrainingProgress('<div class="progress-item success">✅ Training completed successfully!</div>');
    
    // Store models globally
    trainedModels[jobId] = modelArray;
    
    // Show close button
    const trainingCloseBtn = document.getElementById('training-close-btn');
    if (trainingCloseBtn) {
        trainingCloseBtn.style.display = 'block';
    }
    
    // Update jobs list
    console.log('About to call refreshJobs() from completeTraining');
    refreshJobs();
    console.log('Finished calling refreshJobs()');
    
    // Reset wizard settings for next job
    resetWizard();
}

function closeTrainingModal() {
    const trainingModal = document.getElementById('training-modal');
    if (trainingModal) {
        trainingModal.style.display = 'none';
    }
    
    // Reset wizard settings when closing training modal
    resetWizard();
}

// Model details and management
function showModelDetails(model) {
    selectedModel = model;
    
    document.getElementById('model-title').textContent = `${model.name} Details`;
    
    // Display metrics
    const metricsDiv = document.getElementById('model-metrics');
    metricsDiv.innerHTML = '<h4>Metrics:</h4>';
    
    const metricsGrid = document.createElement('div');
    metricsGrid.className = 'metrics-grid';
    
    Object.entries(model.metrics).forEach(([metric, value]) => {
        const metricCard = document.createElement('div');
        metricCard.className = 'metric-card';
        metricCard.innerHTML = `
            <div class="metric-label">${metric.toUpperCase()}</div>
            <div class="metric-value">${value}</div>
        `;
        metricsGrid.appendChild(metricCard);
    });
    
    metricsDiv.appendChild(metricsGrid);
    
    // Display visualization
    const vizDiv = document.getElementById('model-visualization');
    vizDiv.innerHTML = '<h4>Visualization:</h4>';
    
    if (model.visualization.type === 'confusion_matrix') {
        displayConfusionMatrix(vizDiv, model.visualization.data, model.visualization.labels);
    } else if (model.visualization.type === 'scatter_plot') {
        displayScatterPlot(vizDiv, model.visualization.data);
    }
    
    // Update buttons
    const deployBtn = document.getElementById('deploy-btn');
    const testBtn = document.getElementById('test-btn');
    
    const isDeployed = model.isDeployed || false;
    
    if (isDeployed) {
        deployBtn.style.display = 'none';
        testBtn.style.display = 'block';
    } else {
        deployBtn.style.display = 'block';
        testBtn.style.display = 'none';
    }
    
    const modelDetailsModal = document.getElementById('model-details-modal');
    if (modelDetailsModal) {
        modelDetailsModal.style.display = 'block';
    }
}

function closeModelDetails() {
    const modelDetailsModal = document.getElementById('model-details-modal');
    if (modelDetailsModal) {
        modelDetailsModal.style.display = 'none';
    }
    selectedModel = null;
}

// Jobs list management
function updateJobsList() {
    const jobsListDiv = document.getElementById('jobs-list');
    
    // Check if the element exists (user might not be on the AutoML page)
    if (!jobsListDiv) {
        return;
    }

    if (jobHistory.length === 0) {
        jobsListDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-content">
                    <h3>No recent Automated ML jobs to display.</h3>
                    <p>Click "New Automated ML job" to create your first job.</p>
                    <a href="https://aka.ms/mslearn-azure-ml-intro" target="_blank" class="learn-more-link">📚 Learn more about creating Automated ML jobs</a>
                </div>
            </div>
        `;
        return;
    }
    
    jobsListDiv.innerHTML = '';
    
    jobHistory.slice().reverse().forEach(job => {
        const jobDiv = document.createElement('div');
        jobDiv.className = 'job-item';
        jobDiv.onclick = () => navigateToJobDetails(job);
        
        const statusClass = (job.status === 'Completed' || job.status === 'Completed (early stop)' || job.status === 'Completed (timed out)') ? 'completed' : 
                          (job.status === 'Failed (timed out)' || job.status === 'Failed') ? 'failed' : 'running';
        const duration = job.endTime ? 
            Math.round((job.endTime - job.startTime) / 1000) + 's' : 
            'Running...';
        
        jobDiv.innerHTML = `
            <div class="job-header">
                <span class="job-name">${job.name}</span>
                <span class="job-status ${statusClass}">${job.status}</span>
            </div>
            <div class="job-info">
                Task: ${job.taskType} | Target: ${job.targetColumn} | Duration: ${duration}
                ${job.models && job.models.length > 0 ? ` | Models: ${job.models.length}` : ''}
            </div>
        `;
        
        jobsListDiv.appendChild(jobDiv);
    });
}

function updateJobsPageList() {
    const jobsPageListDiv = document.getElementById('jobs-page-list');
    
    // Check if the element exists (user might not be on the Jobs page)
    if (!jobsPageListDiv) {
        return;
    }
    
    if (jobHistory.length === 0) {
        jobsPageListDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-content">
                    <h3>No jobs yet.</h3>
                    <p>Create jobs from the Automated ML page to see them here.</p>
                </div>
            </div>
        `;
        return;
    }
    
    jobsPageListDiv.innerHTML = '';
    
    jobHistory.slice().reverse().forEach(job => {
        const jobDiv = document.createElement('div');
        jobDiv.className = 'job-item';
        jobDiv.onclick = () => navigateToJobDetails(job);
        
        const statusClass = (job.status === 'Completed' || job.status === 'Completed (early stop)' || job.status === 'Completed (timed out)') ? 'completed' : 
                          (job.status === 'Failed (timed out)' || job.status === 'Failed') ? 'failed' : 'running';
        const duration = job.endTime ? 
            Math.round((job.endTime - job.startTime) / 1000) + 's' : 
            'Running...';
        
        jobDiv.innerHTML = `
            <div class="job-header">
                <span class="job-name">${job.name}</span>
                <span class="job-status ${statusClass}">${job.status}</span>
            </div>
            <div class="job-info">
                Task: ${job.taskType} | Target: ${job.targetColumn} | Duration: ${duration}
                ${job.models && job.models.length > 0 ? ` | Models: ${job.models.length}` : ''}
            </div>
        `;
        
        jobsPageListDiv.appendChild(jobDiv);
    });
}

function navigateToJobDetails(job) {
    // This function navigates to the job details page when clicking a job in the list
    showJobDetails(job);
}

function refreshJobs() {
    updateJobsList();
    updateJobsPageList();
}

// Data page management
function updateDataFilesList() {
    const dataFilesListDiv = document.getElementById('data-files-list');
    
    if (uploadedDataFiles.length === 0) {
        dataFilesListDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-content">
                    <h3>No data files uploaded yet.</h3>
                    <p>Upload CSV files through the Automated ML job wizard to see them here.</p>
                </div>
            </div>
        `;
        return;
    }
    
    dataFilesListDiv.innerHTML = '';
    
    uploadedDataFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'data-file-item';
        fileDiv.onclick = () => showDataFileContent(file);
        
        const formatRowCount = (file) => {
            if (file.shape && file.shape[0] !== undefined) {
                const rowCount = file.shape[0];
                return `${rowCount.toLocaleString()} rows`;
            }
            return 'Unknown rows';
        };
        
        const uploadTime = file.uploadTime.toLocaleString();
        
        fileDiv.innerHTML = `
            <div class="data-file-info">
                <span class="data-file-icon">📊</span>
                <div class="data-file-details">
                    <h4>${file.name}</h4>
                    <div class="data-file-meta">Uploaded: ${uploadTime}</div>
                </div>
            </div>
            <div class="data-file-size">${formatRowCount(file)}</div>
        `;
        
        dataFilesListDiv.appendChild(fileDiv);
    });
}

function showDataFileContent(file) {
    // Hide all page content
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.style.display = 'none');
    
    // Show the dataset details page
    const detailsPage = document.getElementById('dataset-details-page');
    detailsPage.style.display = 'block';
    
    // Populate dataset details
    displayDatasetDetailsContent(file);
}

function displayDatasetDetailsContent(file) {
    // Update page title and info
    document.getElementById('dataset-details-title').textContent = file.name || file.filename || 'Dataset';
    document.getElementById('dataset-info-name').textContent = file.name || file.filename || 'Unknown';
    document.getElementById('dataset-info-rows').textContent = file.shape ? file.shape[0] : 'Unknown';
    document.getElementById('dataset-info-columns').textContent = file.shape ? file.shape[1] : 'Unknown';
    
    // Create table for data preview
    const tableContainer = document.getElementById('dataset-preview-table');
    
    if (file.preview && file.preview.length > 0) {
        const columns = file.finalColumns || file.columns || [];
        let tableHTML = '<table class="dataset-table"><thead><tr>';
        
        // Add column headers
        columns.forEach(col => {
            tableHTML += `<th>${col}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        // Add data rows (first 10)
        const previewRows = file.preview.slice(0, 10);
        previewRows.forEach(row => {
            tableHTML += '<tr>';
            columns.forEach(col => {
                const value = row[col] !== undefined ? row[col] : '';
                tableHTML += `<td>${value}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        tableContainer.innerHTML = tableHTML;
    } else {
        tableContainer.innerHTML = '<div class="no-preview">No preview data available</div>';
    }
}

function displayDataFileContent(resultJson) {
    const result = JSON.parse(resultJson);
    
    // Display file info
    const infoDiv = document.getElementById('data-file-info');
    infoDiv.innerHTML = `
        <div class="data-info-grid">
            <div class="data-info-card">
                <div class="data-info-label">Rows</div>
                <div class="data-info-value">${result.info.rows}</div>
            </div>
            <div class="data-info-card">
                <div class="data-info-label">Columns</div>
                <div class="data-info-value">${result.info.columns}</div>
            </div>
            <div class="data-info-card">
                <div class="data-info-label">File Size</div>
                <div class="data-info-value">${Math.round(result.info.size / 1024)} KB</div>
            </div>
        </div>
    `;
    
    // Display preview
    const previewDiv = document.getElementById('data-file-preview');
    previewDiv.innerHTML = `
        <div class="data-preview-note">
            <strong>Preview:</strong> Showing first ${Math.min(10, result.info.rows)} rows of ${result.info.rows} total rows
        </div>
    `;
    
    // Create table
    let tableHtml = '<table class="data-preview-table"><thead><tr>';
    result.column_names.forEach(col => {
        tableHtml += `<th>${col}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    result.preview.forEach(row => {
        tableHtml += '<tr>';
        result.column_names.forEach(col => {
            const value = row[col];
            const displayValue = value === null || value === undefined ? '<em>null</em>' : String(value);
            tableHtml += `<td>${displayValue}</td>`;
        });
        tableHtml += '</tr>';
    });
    
    tableHtml += '</tbody></table>';
    previewDiv.innerHTML += tableHtml;
    
    // Show modal
    const dataContentModal = document.getElementById('data-content-modal');
    if (dataContentModal) {
        dataContentModal.style.display = 'block';
    }
}

function closeDataContentModal() {
    const dataContentModal = document.getElementById('data-content-modal');
    if (dataContentModal) {
        dataContentModal.style.display = 'none';
    }
}


// Modal close on outside click
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    updateJobsList();
    // Show ML App page by default
    showMyAccountPage();
    // Initialize navigation - hide all except ML App
    initializeNavigation();
    // Initialize PyScript status checking (this might be called twice, but that's safe)
    disableNewJobButton();
    // Update initial status with specific message
    updatePyScriptStatus('Loading PyScript ML libraries (pandas, numpy, scikit-learn)...', false);
    
    // Check for PyScript readiness periodically
    checkPyScriptStatus();
});

// Header validation interface
function showHeaderValidationInterface(columnData) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 20px;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    // Create preview table
    const previewTable = document.createElement('table');
    previewTable.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        font-size: 14px;
    `;
    
    // Add rows from raw data
    if (columnData.rawData && Array.isArray(columnData.rawData)) {
        columnData.rawData.forEach((row, index) => {
            const tr = document.createElement('tr');
            const cells = row.split(','); // Simple split for preview
            
            cells.forEach(cell => {
                const td = document.createElement('td');
                td.style.cssText = `
                    border: 1px solid #ddd;
                    padding: 4px 8px;
                    ${index === 0 ? 'background-color: #f5f5f5; font-weight: bold;' : ''}
                `;
                td.textContent = cell.trim();
                tr.appendChild(td);
            });
            
            previewTable.appendChild(tr);
        });
    } else {
        // Add a placeholder row if no raw data
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.style.cssText = `
            border: 1px solid #ddd;
            padding: 10px;
            text-align: center;
            color: #666;
        `;
        td.textContent = 'No preview data available';
        tr.appendChild(td);
        previewTable.appendChild(tr);
    }
    
    // Create header input table
    const headerInputTable = document.createElement('table');
    headerInputTable.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
    `;
    
    const headerRow = document.createElement('tr');
    const headerInputRow = document.createElement('tr');
    
    const numColumns = columnData.suggestedHeaders.length;
    for (let i = 0; i < numColumns; i++) {
        // Header cell
        const headerCell = document.createElement('td');
        headerCell.style.cssText = `
            border: 1px solid #ddd;
            padding: 4px;
            background-color: #f0f8ff;
            font-weight: bold;
            text-align: center;
        `;
        headerCell.textContent = `Column ${i + 1}`;
        headerRow.appendChild(headerCell);
        
        // Input cell
        const inputCell = document.createElement('td');
        inputCell.style.cssText = `
            border: 1px solid #ddd;
            padding: 4px;
        `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = columnData.suggestedHeaders[i];
        input.style.cssText = `
            width: 100%;
            padding: 4px;
            border: 1px solid #ccc;
            border-radius: 4px;
        `;
        input.id = `header-input-${i}`;
        
        inputCell.appendChild(input);
        headerInputRow.appendChild(inputCell);
    }
    
    headerInputTable.appendChild(headerRow);
    headerInputTable.appendChild(headerInputRow);
    
    dialog.innerHTML = `
        <h3>Column Headers Need Specification</h3>
        <p><strong>Issue:</strong> ${columnData.error}</p>
        <p>Please review the data preview below and specify appropriate column headers:</p>
        <h4>Data Preview:</h4>
    `;
    
    dialog.appendChild(previewTable);
    
    const headerSection = document.createElement('div');
    headerSection.innerHTML = '<h4>Specify Column Headers:</h4>';
    headerSection.appendChild(headerInputTable);
    dialog.appendChild(headerSection);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    `;
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #ccc;
        background: white;
        border-radius: 4px;
        cursor: pointer;
    `;
    cancelButton.onclick = () => {
        document.body.removeChild(modal);
        document.getElementById('data-file').value = '';
    };
    
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Headers';
    applyButton.style.cssText = `
        padding: 8px 16px;
        border: none;
        background: #0078d4;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    `;
    applyButton.onclick = () => {
        applyCustomHeaders(columnData, numColumns);
        document.body.removeChild(modal);
    };
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(applyButton);
    dialog.appendChild(buttonContainer);
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
}

function applyCustomHeaders(columnData, numColumns) {
    // Collect new headers
    const newHeaders = [];
    for (let i = 0; i < numColumns; i++) {
        const input = document.getElementById(`header-input-${i}`);
        newHeaders.push(input.value.trim() || `Column_${i + 1}`);
    }
    
    // Reparse the CSV with new headers
    const lines = columnData.rawData;
    const dataLines = lines.slice(1); // Skip original first row
    
    // Create new CSV content with proper headers
    const newCsvContent = [
        newHeaders.join(','),
        ...dataLines
    ].join('\n');
    
    // Parse again with new headers
    parseCSVData(newCsvContent, columnData.filename);
}

// PyScript Initialization System
function notifyPyScriptReady() {
    pyScriptReady = true;
    updatePyScriptStatus('✓ Ready - PyScript ML training available', true);
    enableNewJobButton();
    console.log('PyScript ML libraries loaded successfully - real scikit-learn training available');
}

function updatePyScriptStatus(message, isReady) {
    // Update global status indicator with subtle approach
    const globalStatus = document.getElementById('global-pyscript-status');
    if (globalStatus) {
        if (isReady) {
            // Hide the entire status indicator when ready
            globalStatus.style.display = 'none';
        } else {
            // Show subtle loading with spinner
            globalStatus.style.display = 'flex';
            globalStatus.className = 'status-loading';
            // Update the text while keeping the spinner
            const textSpan = globalStatus.querySelector('span');
            if (textSpan) {
                textSpan.textContent = message;
            }
        }
    }
    
    // Update any remaining pyscript-status elements (though we removed them from wizard)
    const statusElements = document.querySelectorAll('.pyscript-status');
    statusElements.forEach(element => {
        if (isReady) {
            element.style.display = 'none';
        } else {
            element.innerHTML = `<small>⏳ ${message}</small>`;
            element.style.display = 'block';
        }
    });
}

function enableNewJobButton() {
    const newJobButton = document.querySelector('button[onclick="openNewJobWizard()"]');
    if (newJobButton) {
        newJobButton.disabled = false;
        newJobButton.title = 'Start a new Automated ML training job';
    }
}

function disableNewJobButton() {
    const newJobButton = document.querySelector('button[onclick="openNewJobWizard()"]');
    if (newJobButton) {
        newJobButton.disabled = true;
        newJobButton.title = 'Please wait for libraries to load...';
    }
}

// Handle training completion from PyScript
function handleTrainingComplete(resultsJson) {
    console.log('Received training results:', typeof resultsJson, resultsJson);
    
    try {
        // Check if it's already an object or needs parsing
        let results;
        if (typeof resultsJson === 'string') {
            results = JSON.parse(resultsJson);
        } else if (typeof resultsJson === 'object' && resultsJson !== null) {
            results = resultsJson;
        } else {
            throw new Error(`Unexpected data type: ${typeof resultsJson}`);
        }
        
        if (results.success) {
            console.log('Training completed successfully:', results.results);
            
            // Store results
            trainedModels[results.job_id] = results.results;
            
            // Update job status
            const job = jobHistory.find(j => j.id === results.job_id);
            if (job) {
                // Set status based on timeout, early stopping, or normal completion
                if (results.timed_out && results.results.length > 0) {
                    job.status = 'Completed (timed out)';
                } else if (results.timed_out && results.results.length === 0) {
                    job.status = 'Failed (timed out)';
                } else if (results.early_stop_triggered) {
                    job.status = 'Completed (stopped early)';
                } else {
                    job.status = 'Completed';
                }
                job.models = results.results;
                job.endTime = new Date();
                job.early_stop_triggered = results.early_stop_triggered || false;
                job.timed_out = results.timed_out || false;
                
                // Update child job statuses
                if (job.childJobs && job.childJobs.length > 0) {
                    job.childJobs.forEach((childJob, index) => {
                        // Check if this child job corresponds to a trained model
                        const modelResult = results.results && results.results.find(r => r.name === childJob.algorithm);
                        
                        if (modelResult) {
                            // This model was trained
                            childJob.status = 'Completed';
                            childJob.endTime = new Date();
                            childJob.modelResult = modelResult;
                            
                            // Set child job status based on model training success
                            if (modelResult.error) {
                                childJob.status = 'Failed';
                                childJob.error = modelResult.error;
                            } else {
                                // Copy metrics to child job for display
                                childJob.metrics = modelResult.metrics;
                                childJob.primary_score = modelResult.primary_score;
                            }
                        } else if (results.timed_out) {
                            // This model was not trained due to timeout - check if it was completed vs skipped
                            const modelResult = results.results.find(result => result.algorithm === childJob.algorithm);
                            if (modelResult) {
                                // Model was completed before timeout
                                childJob.status = 'Completed (timed out)';
                                childJob.modelResult = modelResult;
                                childJob.metrics = modelResult.metrics;
                                childJob.primary_score = modelResult.primary_score;
                            } else {
                                // Model was not trained due to timeout
                                childJob.status = 'Skipped (timed out)';
                                childJob.skipped_reason = 'Training stopped due to experiment timeout';
                            }
                            childJob.endTime = new Date();
                        } else if (results.early_stop_triggered) {
                            // This model was not trained due to early stopping
                            childJob.status = 'Skipped (stopped early)';
                            childJob.endTime = new Date();
                            childJob.skipped_reason = 'Training stopped early when metric threshold was met';
                        } else {
                            // This shouldn't happen in normal cases, but handle it
                            childJob.status = 'Completed';
                            childJob.endTime = new Date();
                        }
                    });
                }
                
                // Store job info with training logs if available
                if (results.job_info) {
                    job.job_info = results.job_info;
                    job.training_logs = results.job_info.training_logs;
                    console.log('Stored training logs:', job.training_logs?.length || 0, 'entries');
                }
                

                
                updateJobsList();
                
                // Update current job details if this is the active job
                if (currentJobDetails && currentJobDetails.id === results.job_id) {
                    console.log('Updating current job details after training completion');
                    currentJobDetails = job;
                    updateJobDetailsContent(job);
                }
            }
            
            // Complete the training process (even for timeout, as we may have partial results)
            if (results.timed_out) {
                // For timeout, we still call completeTraining but with timeout status
                completeTraining(results.results, results.job_id);
            } else {
                completeTraining(results.results, results.job_id);
            }
            
        } else {
            console.error('Training failed:', results.error);
            alert(`Training failed: ${results.error}`);
            
            // Update job status to failed
            const job = jobHistory.find(j => j.id === results.job_id);
            if (job) {
                job.status = 'Failed';
                job.error = results.error;
                job.endTime = new Date();
                
                // Update child job statuses to failed
                if (job.childJobs && job.childJobs.length > 0) {
                    job.childJobs.forEach(childJob => {
                        childJob.status = 'Failed';
                        childJob.endTime = new Date();
                        childJob.error = results.error;
                    });
                }
                
                // Store job info with training logs even on failure
                if (results.job_info) {
                    job.job_info = results.job_info;
                    job.training_logs = results.job_info.training_logs;
                    console.log('Stored error logs:', job.training_logs?.length || 0, 'entries');
                }
                

                
                updateJobsList();
            }
        }
    } catch (error) {
        console.error('Error handling training results:', error);
        alert(`Error processing training results: ${error.message}`);
    }
}

// Job Details Page Functions
let currentJobDetails = null;
let currentChildJobDetails = null;

function showJobDetails(job) {
    currentJobDetails = job;
    currentChildJobDetails = null; // Reset child job view
    
    // Hide all other pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show job details page
    document.getElementById('job-details-page').style.display = 'block';
    
    // Update job details content
    updateJobDetailsContent(job);
    
    // Show overview tab by default
    showJobTab('overview');
}

function showChildJobDetails(childJob, parentJob) {
    currentChildJobDetails = childJob;
    currentJobDetails = parentJob; // Keep parent job reference
    
    // Hide all other pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show child job details page
    document.getElementById('child-job-details-page').style.display = 'block';
    
    // Update child job details content
    updateChildJobDetailsContent(childJob, parentJob);
    
    // Show overview tab by default for child job
    showChildJobTab('overview');
}

function navigateToChildJob(algorithmName, parentJob) {
    // Find the corresponding child job by algorithm name
    if (!parentJob || !parentJob.childJobs) {
        console.error('No parent job or child jobs available');
        return;
    }
    
    console.log('Looking for algorithm:', algorithmName);
    console.log('Available child jobs:', parentJob.childJobs.map(job => ({
        displayName: job.displayName,
        algorithm: job.algorithm
    })));
    
    // First, try to find by exact algorithm match
    let childJob = parentJob.childJobs.find(job => job.algorithm === algorithmName);
    
    // If not found by algorithm, try to match by model name to child job index
    if (!childJob && parentJob.models) {
        const modelIndex = parentJob.models.findIndex(model => 
            model.name === algorithmName || model.display_name === algorithmName
        );
        if (modelIndex >= 0 && modelIndex < parentJob.childJobs.length) {
            childJob = parentJob.childJobs[modelIndex];
            console.log(`Matched algorithm "${algorithmName}" to child job by model index: ${modelIndex}`);
        }
    }
    
    // If still not found, try partial matches on algorithm names
    if (!childJob) {
        childJob = parentJob.childJobs.find(job => 
            job.algorithm && (
                job.algorithm.includes(algorithmName) ||
                algorithmName.includes(job.algorithm)
            )
        );
    }
    
    if (childJob) {
        console.log('Navigating to child job:', childJob);
        showChildJobDetails(childJob, parentJob);
    } else {
        console.error('Child job not found for algorithm:', algorithmName);
        console.error('Available algorithms in child jobs:', parentJob.childJobs.map(job => job.algorithm));
        console.error('Available models:', parentJob.models ? parentJob.models.map(m => m.name) : 'None');
    }
}

function updateJobDetailsContent(job) {
    try {
        // Update header information
        document.getElementById('job-details-title').textContent = job.name;
        
        // Update status badge
        const statusBadge = document.getElementById('job-status-badge');
        const statusText = document.getElementById('job-status-text');
        statusText.textContent = job.status; // Display the status as-is since it should already be properly formatted
        
        // Update status badge classes  
        let statusClass;
        if (job.status === 'Completed (timed out)') {
            statusClass = 'completed-timeout';
        } else if (job.status.includes('Completed')) {
            statusClass = 'completed';
        } else if (job.status === 'Failed (timed out)') {
            statusClass = 'failed-timeout';
        } else if (job.status === 'Failed') {
            statusClass = 'failed';
        } else {
            statusClass = job.status.toLowerCase();
        }
        statusBadge.className = `job-status-badge ${statusClass}`;
        
        // Update Register model button state based on job status
        if (job.status === 'Completed' || job.status === 'Completed (stopped early)' || job.status === 'Completed (timed out)') {
            enableRegisterButton();
        } else {
            disableRegisterButton();
        }
        
        // Update properties section
        document.getElementById('properties-status').innerHTML = `
            <span class="status-icon">●</span>
            <span>${job.status}</span>
        `;
        
        const createdDate = job.startTime.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        document.getElementById('properties-created-on').textContent = createdDate;
        document.getElementById('properties-start-time').textContent = createdDate;
        document.getElementById('properties-name').textContent = job.name;
    
    // Update inputs section - get dataset name (prefer custom name over filename)
    let datasetName = 'training_data.csv';
    
    // Try to get dataset name from various sources, prioritizing custom names
    if (typeof selectedDataset !== 'undefined' && selectedDataset) {
        // Use custom name if available, otherwise use filename
        datasetName = selectedDataset.customName || selectedDataset.name || selectedDataset.filename;
    } else if (typeof currentData !== 'undefined' && currentData) {
        // Use custom name if available, otherwise use name or filename
        datasetName = currentData.customName || currentData.name || currentData.filename;
    } else if (typeof uploadedDataFiles !== 'undefined' && uploadedDataFiles && uploadedDataFiles.length > 0) {
        // Get the most recently uploaded file and use its custom name
        const lastFile = uploadedDataFiles[uploadedDataFiles.length - 1];
        if (lastFile) {
            datasetName = lastFile.customName || lastFile.name || lastFile.filename;
        }
    }
    
    // Safely update input data asset element
    const inputDataAssetElement = document.getElementById('input-data-asset');
    if (inputDataAssetElement) {
        inputDataAssetElement.textContent = datasetName;
    } else {
        console.warn('input-data-asset element not found');
    }
    
    // Update run summary
    const summaryTaskTypeElement = document.getElementById('summary-task-type');
    if (summaryTaskTypeElement) {
        summaryTaskTypeElement.textContent = job.taskType.charAt(0).toUpperCase() + job.taskType.slice(1);
    } else {
        console.warn('summary-task-type element not found');
    }
    
    // Update primary metric - use the actual stored value
    const primaryMetric = job.primaryMetric;
    const primaryMetricDisplay = getMetricDisplayName(primaryMetric, job.taskType);
    const primaryMetricElement = document.getElementById('summary-primary-metric');
    if (primaryMetricElement) {
        primaryMetricElement.textContent = primaryMetricDisplay;
    } else {
        console.warn('summary-primary-metric element not found');
    }
    
    // Update featurization based on user's settings
    let featurizationText = 'Auto';
    if (job.normalizeFeatures || job.missingDataStrategy !== 'remove' || 
        (job.categoricalSettings && Object.keys(job.categoricalSettings).length > 0)) {
        featurizationText = 'Custom';
    }
    const featurizationElement = document.getElementById('summary-featurization');
    if (featurizationElement) {
        featurizationElement.textContent = featurizationText;
    } else {
        console.warn('summary-featurization element not found');
    }
    
    // Update best model section if training is complete
    updateBestModelSection(job);
    
    // Add training progress section if job is running
    if (job.status === 'running') {
        addTrainingProgressSection();
    }
    
    } catch (error) {
        console.error('Error updating job details content:', error);
        console.error('Job object:', job);
    }
}

function updateBestModelSection(job) {
    const bestModelContent = document.getElementById('best-model-content');
    
    if ((job.status === 'Completed' || job.status === 'Completed (stopped early)' || job.status === 'Completed (timed out)') && job.models && job.models.length > 0) {
        const bestModel = job.models.find(m => m.is_best);
        if (bestModel) {
            // Get the proper display name for the primary metric
            const primaryMetricDisplay = getMetricDisplayName(job.primaryMetric, job.taskType);
            
            console.log('🔍 DEBUG: Best model display values:');
            console.log('  - Primary metric:', job.primaryMetric);
            console.log('  - Primary metric display name:', primaryMetricDisplay);
            console.log('  - Best model name:', bestModel.name);
            console.log('  - Best model primary_score:', bestModel.primary_score);
            console.log('  - Best model metrics:', bestModel.metrics);
            console.log('  - Direct metric value:', bestModel.metrics[job.primaryMetric]);
            
            bestModelContent.innerHTML = `
                <div class="best-model-display">
                    <div class="best-model-header">
                        <span class="best-model-badge">Best Model</span>
                    </div>
                    <div class="best-model-algorithm">Algorithm name: 
                        <button class="algorithm-link" onclick="navigateToChildJob('${bestModel.name.replace(/'/g, "\\'")}', currentJobDetails)" title="View child job details">
                            ${bestModel.name}
                        </button>
                    </div>
                    <div class="best-model-score">${typeof bestModel.primary_score === 'number' ? bestModel.primary_score.toFixed(4) : bestModel.primary_score}</div>
                    <div class="best-model-metric">Primary metric: ${primaryMetricDisplay}</div>
                </div>
            `;
        }
    } else {
        bestModelContent.innerHTML = `
            <div class="no-data-message">
                <span class="no-data-icon">ℹ</span>
                <span>No data</span>
            </div>
        `;
    }
}

function addTrainingProgressSection() {
    const overviewTab = document.getElementById('overview-tab');
    let progressSection = document.getElementById('training-progress-section');
    
    if (!progressSection) {
        progressSection = document.createElement('div');
        progressSection.id = 'training-progress-section';
        progressSection.className = 'training-progress-section';
        progressSection.innerHTML = `
            <h4>Training Progress</h4>
            <div id="training-progress-content">
                <div class="progress-item info">🔄 Preparing data and starting model training...</div>
            </div>
        `;
        overviewTab.appendChild(progressSection);
    }
}

function updateJobTrainingProgress(progressHtml) {
    const progressContent = document.getElementById('training-progress-content');
    if (progressContent) {
        progressContent.innerHTML += progressHtml;
    }
}

function showJobTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.style.display = 'none';
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab panel
    const selectedPanel = document.getElementById(`${tabName}-tab`);
    if (selectedPanel) {
        selectedPanel.style.display = 'block';
        selectedPanel.classList.add('active');
    }
    
    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[onclick="showJobTab('${tabName}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Update models tab content if showing models
    if (tabName === 'models' && currentJobDetails) {
        updateModelsTabContent();
    }
    
    // Update outputs tab content if showing outputs
    if (tabName === 'outputs' && currentJobDetails) {
        updateOutputsTabContent();
    }
    
    // Update data guardrails tab content if showing data guardrails
    if (tabName === 'data-guardrails' && currentJobDetails) {
        updateDataGuardrailsTabContent();
    }
    
    // Update child jobs tab content if showing child jobs
    if (tabName === 'child-jobs' && currentJobDetails) {
        updateChildJobsTabContent();
    }
}

function showChildJobTab(tabName) {
    // Hide all child job tab panels
    document.querySelectorAll('#child-job-details-page .tab-panel').forEach(panel => {
        panel.style.display = 'none';
        panel.classList.remove('active');
    });
    
    // Remove active class from all child job tab buttons
    document.querySelectorAll('#child-job-details-page .tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected child job tab
    const selectedTab = document.getElementById(`child-${tabName}-tab`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
    }
    
    // Add active class to corresponding button
    const selectedButton = document.querySelector(`#child-job-details-page .tab-button[onclick="showChildJobTab('${tabName}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Update specific tab content if needed
    if (tabName === 'metrics' && currentChildJobDetails) {
        updateChildJobMetricsContent();
    } else if (tabName === 'model' && currentChildJobDetails) {
        updateChildJobModelContent();
    } else if (tabName === 'outputs' && currentChildJobDetails) {
        updateChildJobOutputsContent();
    }
}

function updateModelsTabContent() {
    const modelsResults = document.getElementById('job-model-results');
    
    console.log('🔍 DEBUG updateModelsTabContent:');
    console.log('  - currentJobDetails:', currentJobDetails);
    console.log('  - status:', currentJobDetails?.status);
    console.log('  - models:', currentJobDetails?.models);
    console.log('  - models length:', currentJobDetails?.models?.length);
    
    if ((currentJobDetails.status === 'Completed' || currentJobDetails.status === 'Completed (stopped early)' || currentJobDetails.status === 'Completed (timed out)') && currentJobDetails.models && currentJobDetails.models.length > 0) {
        // Get the primary metric name for the column header
        const primaryMetric = currentJobDetails.primaryMetric || 'auc';
        const primaryMetricDisplayName = getMetricDisplayName(primaryMetric, currentJobDetails.taskType);
        
        // Create early stopping note if applicable
        const earlyStopNote = currentJobDetails.early_stop_triggered ? 
            `<div class="early-stop-notice">
                <div class="notice-icon">⏰</div>
                <div class="notice-content">
                    <strong>Training stopped early</strong>
                    <p>Metric threshold was met. Only ${currentJobDetails.models.length} of ${currentJobDetails.childJobs ? currentJobDetails.childJobs.length : currentJobDetails.models.length} algorithms were trained.</p>
                </div>
            </div>` : '';

        // Create table structure
        modelsResults.innerHTML = `
            ${earlyStopNote}
            <div class="models-table-container">
                <table class="models-table">
                    <thead>
                        <tr>
                            <th>Algorithm</th>
                            <th>${primaryMetricDisplayName}</th>
                            <th>Created on</th>
                        </tr>
                    </thead>
                    <tbody id="models-table-body">
                    </tbody>
                </table>
            </div>
        `;
        
        const tableBody = document.getElementById('models-table-body');
        
        currentJobDetails.models.forEach(model => {
            const row = document.createElement('tr');
            row.className = model.is_best ? 'best-model-row' : '';
            
            // Get the primary metric value
            const primaryMetricValue = model.primary_score || model.metrics[primaryMetric] || 'N/A';
            const formattedValue = typeof primaryMetricValue === 'number' ? primaryMetricValue.toFixed(4) : primaryMetricValue;
            
            // Format the created date
            let createdDate = 'N/A';
            console.log('Model data for', model.name, ':', model); // Debug log
            console.log('Created at value:', model.created_at); // Debug log
            
            if (model.created_at) {
                try {
                    const date = new Date(model.created_at);
                    console.log('Parsed date:', date); // Debug log
                    createdDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                } catch (e) {
                    console.error('Error parsing date:', e); // Debug log
                    createdDate = 'N/A';
                }
            } else {
                console.log('No created_at field found for model:', model.name); // Debug log
            }
            
            row.innerHTML = `
                <td class="algorithm-cell">
                    <button class="algorithm-link" onclick="navigateToChildJob('${model.name.replace(/'/g, "\\'")}', currentJobDetails)" title="View child job details">
                        ${model.display_name || model.name}
                    </button>
                    ${model.is_best ? '<span class="best-model-badge">Best Model</span>' : ''}
                </td>
                <td class="metric-cell">${formattedValue}</td>
                <td class="created-cell">${createdDate}</td>
            `;
            
            tableBody.appendChild(row);
        });
    } else if (currentJobDetails.status === 'running') {
        modelsResults.innerHTML = '<div class="no-data-message"><span class="no-data-icon">⏳</span><span>Training in progress...</span></div>';
    } else {
        modelsResults.innerHTML = '<div class="no-data-message"><span class="no-data-icon">ℹ</span><span>No models available</span></div>';
    }
}

function updateOutputsTabContent() {
    const outputsContent = document.getElementById('outputs-content');
    
    if (!outputsContent) {
        console.warn('outputs-content element not found');
        return;
    }
    
    // Check if we have training logs to display
    if (currentJobDetails && currentJobDetails.training_logs && currentJobDetails.training_logs.length > 0) {
        // Create logs display container
        outputsContent.innerHTML = `
            <div class="logs-container">
                <div class="logs-header">
                    <h3>Training Logs</h3>
                    <div class="logs-info">
                        <span class="logs-count">${currentJobDetails.training_logs.length} log entries</span>
                    </div>
                </div>
                <div class="logs-content" id="training-logs-list">
                </div>
            </div>
        `;
        
        const logsList = document.getElementById('training-logs-list');
        
        // Display each log entry
        currentJobDetails.training_logs.forEach((logEntry, index) => {
            const logElement = document.createElement('div');
            logElement.className = 'log-entry';
            
            // Parse timestamp if available
            let timeDisplay = '';
            if (logEntry.timestamp) {
                timeDisplay = `<span class="log-timestamp">[${logEntry.timestamp}]</span>`;
            }
            
            // Determine log level class
            let levelClass = 'info';
            if (logEntry.level) {
                levelClass = logEntry.level;
            } else if (logEntry.message && typeof logEntry.message === 'string') {
                const msg = logEntry.message.toLowerCase();
                if (msg.includes('error') || msg.includes('failed') || msg.includes('❌')) {
                    levelClass = 'error';
                } else if (msg.includes('warning') || msg.includes('⚠️')) {
                    levelClass = 'warning';
                } else if (msg.includes('completed') || msg.includes('finished') || msg.includes('✅') || msg.includes('🎉')) {
                    levelClass = 'success';
                }
            }
            
            logElement.innerHTML = `
                <div class="log-header">
                    ${timeDisplay}
                    <span class="log-level ${levelClass}"></span>
                </div>
                <div class="log-message">${logEntry.message || 'No message'}</div>
            `;
            
            logsList.appendChild(logElement);
        });
        
    } else if (currentJobDetails && currentJobDetails.status === 'running') {
        // Show loading message for running jobs
        outputsContent.innerHTML = `
            <div class="logs-placeholder">
                <div class="logs-placeholder-icon">⏳</div>
                <div class="logs-placeholder-text">Training in progress...</div>
                <div class="logs-placeholder-subtext">Logs will appear here as training proceeds</div>
            </div>
        `;
    } else if (currentJobDetails && currentJobDetails.status === 'Failed' && currentJobDetails.error) {
        // Show error information for failed jobs
        outputsContent.innerHTML = `
            <div class="logs-container">
                <div class="logs-header">
                    <h3>Error Information</h3>
                </div>
                <div class="error-content">
                    <div class="log-entry error">
                        <div class="log-header">
                            <span class="log-level error"></span>
                            <span class="error-title">Training Failed</span>
                        </div>
                        <div class="log-message">${currentJobDetails.error}</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Show no logs available message
        outputsContent.innerHTML = `
            <div class="logs-placeholder">
                <div class="logs-placeholder-icon">ℹ</div>
                <div class="logs-placeholder-text">No logs available</div>
                <div class="logs-placeholder-subtext">Training logs will appear here after job completion</div>
            </div>
        `;
    }
}


function updateChildJobOutputsContent() {
    const outputsContent = document.getElementById('child-outputs-content');
    
    if (!outputsContent) {
        console.warn('child-outputs-content element not found');
        return;
    }
    
    // Get the current child job details and parent job
    const childJob = currentChildJobDetails;
    const parentJob = currentJobDetails;
    
    if (!childJob || !parentJob) {
        outputsContent.innerHTML = `
            <div class="logs-placeholder">
                <div class="logs-placeholder-icon">ℹ</div>
                <div class="logs-placeholder-text">No logs available</div>
                <div class="logs-placeholder-subtext">Training logs will appear here after job completion</div>
            </div>
        `;
        return;
    }
    
    // Check if we have training logs from the parent job
    if (parentJob.training_logs && parentJob.training_logs.length > 0) {
        // Use all training logs from the parent job
        const logsToShow = parentJob.training_logs;
        const logCount = logsToShow.length;
        
        // Create logs display container
        outputsContent.innerHTML = `
            <div class="outputs-section">
                <h3>Outputs</h3>
                <div class="output-details">
                    <div class="output-item">
                        <div class="output-label">Model Output</div>
                        <div class="output-value" id="child-output-model-asset">${childJob.displayName}-model</div>
                    </div>
                </div>
            </div>
            <div class="logs-container">
                <div class="logs-header">
                    <h3>Training Logs</h3>
                    <div class="logs-info">
                        <span class="logs-count">${logCount} log entries</span>
                    </div>
                </div>
                <div class="logs-content" id="child-training-logs-list">
                </div>
            </div>
        `;
        
        const logsList = document.getElementById('child-training-logs-list');
        
        // Display each log entry
        logsToShow.forEach((logEntry, index) => {
            const logElement = document.createElement('div');
            logElement.className = 'log-entry';
            
            // Parse timestamp if available
            let timeDisplay = '';
            if (logEntry.timestamp) {
                timeDisplay = `<span class="log-timestamp">[${logEntry.timestamp}]</span>`;
            }
            
            // Determine log level class
            let levelClass = 'info';
            if (logEntry.level) {
                levelClass = logEntry.level;
            } else if (logEntry.message && typeof logEntry.message === 'string') {
                const msg = logEntry.message.toLowerCase();
                if (msg.includes('error') || msg.includes('failed') || msg.includes('❌')) {
                    levelClass = 'error';
                } else if (msg.includes('warning') || msg.includes('⚠️')) {
                    levelClass = 'warning';
                } else if (msg.includes('completed') || msg.includes('finished') || msg.includes('✅') || msg.includes('🎉')) {
                    levelClass = 'success';
                }
            }
            
            logElement.innerHTML = `
                <div class="log-header">
                    ${timeDisplay}
                    <span class="log-level ${levelClass}"></span>
                </div>
                <div class="log-message">${logEntry.message || 'No message'}</div>
            `;
            
            logsList.appendChild(logElement);
        });
        
    } else if (childJob.status === 'running') {
        // Show loading message for running child jobs
        outputsContent.innerHTML = `
            <div class="outputs-section">
                <h3>Outputs</h3>
                <div class="output-details">
                    <div class="output-item">
                        <div class="output-label">Model Output</div>
                        <div class="output-value">${childJob.displayName}-model (in progress)</div>
                    </div>
                </div>
            </div>
            <div class="logs-placeholder">
                <div class="logs-placeholder-icon">⏳</div>
                <div class="logs-placeholder-text">Training in progress...</div>
                <div class="logs-placeholder-subtext">Logs will appear here as training proceeds</div>
            </div>
        `;
    } else {
        // Show no logs available message
        outputsContent.innerHTML = `
            <div class="outputs-section">
                <h3>Outputs</h3>
                <div class="output-details">
                    <div class="output-item">
                        <div class="output-label">Model Output</div>
                        <div class="output-value" id="child-output-model-asset">${childJob.displayName}-model</div>
                    </div>
                </div>
            </div>
            <div class="logs-placeholder">
                <div class="logs-placeholder-icon">ℹ</div>
                <div class="logs-placeholder-text">No logs available</div>
                <div class="logs-placeholder-subtext">Training logs will appear here after job completion</div>
            </div>
        `;
    }
}

function updateChildJobDetailsContent(childJob, parentJob) {
    try {
        // Update header information
        document.getElementById('child-job-details-title').textContent = childJob.displayName;
        
        // Update status badge
        const statusBadge = document.getElementById('child-job-status-badge');
        const statusText = document.getElementById('child-job-status-text');
        statusText.textContent = childJob.status;
        
        // Update status badge classes
        let childStatusClass;
        if (childJob.status === 'Completed (timed out)') {
            childStatusClass = 'completed-timeout';
        } else if (childJob.status.includes('Completed')) {
            childStatusClass = 'completed';
        } else if (childJob.status === 'Failed (timed out)') {
            childStatusClass = 'failed-timeout';
        } else if (childJob.status === 'Failed') {
            childStatusClass = 'failed';
        } else {
            childStatusClass = childJob.status.toLowerCase().replace(/\s+/g, '-');
        }
        statusBadge.className = `job-status-badge ${childStatusClass}`;
        
        // Update properties section
        document.getElementById('child-properties-status').innerHTML = `
            <span class="status-icon">●</span>
            <span>${childJob.status}</span>
        `;
        
        // Format created date
        const createdDate = childJob.createdOn ? childJob.createdOn.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';
        
        document.getElementById('child-properties-created-on').textContent = createdDate;
        
        // Calculate and display duration
        let duration = 'N/A';
        if (childJob.endTime && childJob.startTime) {
            const durationMs = childJob.endTime - childJob.startTime;
            const durationSeconds = Math.round(durationMs / 1000);
            if (durationSeconds < 60) {
                duration = `${durationSeconds}s`;
            } else {
                const minutes = Math.floor(durationSeconds / 60);
                const seconds = durationSeconds % 60;
                duration = `${minutes}m ${seconds}s`;
            }
        }
        document.getElementById('child-properties-duration').textContent = duration;
        
        // Update compute target
        document.getElementById('child-properties-compute-target').textContent = childJob.computeType || 'Serverless';
        
        // Update name  
        document.getElementById('child-properties-name').textContent = childJob.displayName;
        
        // Update input data asset - prioritize custom dataset name over filename
        let datasetName = 'training_data';
        
        // Try multiple sources for dataset name, prioritizing custom names
        if (parentJob && parentJob.datasetInfo && parentJob.datasetInfo.customName) {
            datasetName = parentJob.datasetInfo.customName;
        } else if (typeof selectedDataset !== 'undefined' && selectedDataset) {
            datasetName = selectedDataset.customName || selectedDataset.name || selectedDataset.filename;
        } else if (typeof currentData !== 'undefined' && currentData) {
            datasetName = currentData.customName || currentData.name || currentData.filename;
        } else if (parentJob && parentJob.datasetInfo && (parentJob.datasetInfo.name || parentJob.datasetInfo.filename)) {
            datasetName = parentJob.datasetInfo.name || parentJob.datasetInfo.filename;
        }
        
        // Remove file extension if it exists to show clean dataset name
        if (datasetName && datasetName.includes('.')) {
            const parts = datasetName.split('.');
            if (parts.length > 1 && parts[parts.length - 1].length <= 4) { // Common file extensions are usually 4 chars or less
                datasetName = parts.slice(0, -1).join('.');
            }
        }
        
        const childInputDataAssetElement = document.getElementById('child-input-data-asset');
        if (childInputDataAssetElement) {
            childInputDataAssetElement.textContent = datasetName;
        }
        
        // Update output information using format: {Parent-Job}-{Child-Job}-model
        const parentJobName = parentJob ? parentJob.name : 'ML-Job';
        const childJobName = childJob.displayName || childJob.id || 'child';
        const outputName = `${parentJobName}-${childJobName}-model`;
        
        const childOutputNameElement = document.getElementById('child-output-name');
        if (childOutputNameElement) {
            childOutputNameElement.textContent = `Output name: ${outputName}`;
        }
        
        const childOutputModelAssetElement = document.getElementById('child-output-model-asset');
        if (childOutputModelAssetElement) {
            childOutputModelAssetElement.textContent = outputName;
        }
        
    } catch (error) {
        console.error('Error updating child job details content:', error);
        console.error('Child job object:', childJob);
    }
}

function updateChildJobMetricsContent() {
    const metricsDisplay = document.getElementById('child-metrics-display');
    
    if (!currentChildJobDetails || !currentChildJobDetails.metrics) {
        metricsDisplay.innerHTML = `
            <div class="no-data-message">
                <span class="no-data-icon">ℹ</span>
                <span>No metrics available</span>
            </div>
        `;
        return;
    }
    
    // Display all metrics for this child job
    const metrics = currentChildJobDetails.metrics;
    let metricsHtml = '<div class="metrics-grid">';
    
    Object.entries(metrics).forEach(([metric, value]) => {
        const displayName = getMetricDisplayName(metric, currentJobDetails?.taskType || 'classification');
        const formattedValue = typeof value === 'number' ? value.toFixed(4) : value;
        
        metricsHtml += `
            <div class="metric-item">
                <div class="metric-name">${displayName}</div>
                <div class="metric-value">${formattedValue}</div>
            </div>
        `;
    });
    
    metricsHtml += '</div>';
    
    // Add visualization section
    metricsHtml += `
        <div class="metrics-visualization">
            <h5>Model Performance Visualization</h5>
            <div class="visualization-container">
                <canvas id="metrics-chart" width="400" height="300"></canvas>
            </div>
        </div>
    `;
    
    metricsDisplay.innerHTML = metricsHtml;
    
    // Generate the appropriate chart based on task type
    generateMetricsVisualization();
}

function generateMetricsVisualization() {
    const canvas = document.getElementById('metrics-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const taskType = currentJobDetails?.taskType || 'classification';
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (taskType === 'classification') {
        generateConfusionMatrix(ctx, canvas);
    } else if (taskType === 'regression') {
        generateScatterPlot(ctx, canvas);
    }
}

function generateConfusionMatrix(ctx, canvas) {
    // Clear the canvas completely first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate sample confusion matrix data based on the model's accuracy
    const accuracy = currentChildJobDetails?.metrics?.accuracy || 0.85;
    const sampleSize = 100;
    
    // Create a realistic confusion matrix
    const truePositives = Math.round(accuracy * sampleSize * 0.6);
    const trueNegatives = Math.round(accuracy * sampleSize * 0.4);
    const falsePositives = Math.round((1 - accuracy) * sampleSize * 0.4);
    const falseNegatives = Math.round((1 - accuracy) * sampleSize * 0.6);
    
    const confusionMatrix = [
        [trueNegatives, falsePositives],
        [falseNegatives, truePositives]
    ];
    
    const labels = ['Predicted Negative', 'Predicted Positive'];
    const actualLabels = ['Actual Negative', 'Actual Positive'];
    
    // Draw confusion matrix
    const cellWidth = 120;
    const cellHeight = 60;
    const startX = 80;
    const startY = 60;
    
    // Set font
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Draw title
    ctx.fillStyle = '#0078d4';
    ctx.font = '16px Arial';
    ctx.fillText('Confusion Matrix', canvas.width / 2, 25);
    
    // Draw labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#0078d4';
    ctx.fillText('Predicted', canvas.width / 2, 50);
    
    // Find min and max values for color scaling
    const allValues = confusionMatrix.flat();
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Draw matrix
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            const x = startX + j * cellWidth;
            const y = startY + i * cellHeight;
            const value = confusionMatrix[i][j];
            
            // Calculate color intensity based on value (0 = white, 1 = full Microsoft blue)
            const intensity = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0;
            
            // Create gradient from white to Microsoft blue
            const r = Math.round(255 - (255 - 0) * intensity);    // Red: 255 → 0
            const g = Math.round(255 - (255 - 120) * intensity);  // Green: 255 → 120
            const b = Math.round(255 - (255 - 212) * intensity);  // Blue: 255 → 212
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            // Draw cell
            ctx.fillRect(x, y, cellWidth, cellHeight);
            
            // Draw border
            ctx.strokeStyle = '#0078d4';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellWidth, cellHeight);
            
            // Draw value - use white text on dark backgrounds, dark text on light backgrounds
            ctx.fillStyle = intensity > 0.6 ? '#ffffff' : '#0078d4';
            ctx.font = '18px Arial';
            ctx.fillText(value, x + cellWidth/2, y + cellHeight/2 + 6);
        }
    }
    
    // Draw axis labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#0078d4';
    
    // Column labels (predicted)
    ctx.fillText('Negative', startX + cellWidth/2, startY - 10);
    ctx.fillText('Positive', startX + cellWidth + cellWidth/2, startY - 10);
    
    // Row labels (actual) - rotated
    ctx.save();
    ctx.translate(startX - 30, startY + cellHeight/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillStyle = '#0078d4';
    ctx.fillText('Negative', 0, 0);
    ctx.restore();
    
    ctx.save();
    ctx.translate(startX - 30, startY + cellHeight + cellHeight/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillStyle = '#0078d4';
    ctx.fillText('Positive', 0, 0);
    ctx.restore();
    
    // Add "Actual" label
    ctx.save();
    ctx.translate(20, canvas.height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillStyle = '#0078d4';
    ctx.font = '12px Arial';
    ctx.fillText('Actual', 0, 0);
    ctx.restore();
}

function generateScatterPlot(ctx, canvas) {
    // Generate sample scatter plot data based on the model's R² score
    const r2Score = currentChildJobDetails?.metrics?.r2 || currentChildJobDetails?.metrics?.r2_score || 0.8;
    const mae = currentChildJobDetails?.metrics?.mae || currentChildJobDetails?.metrics?.mean_absolute_error || 2.5;
    
    const numPoints = 50;
    const points = [];
    
    // Generate correlated data points
    for (let i = 0; i < numPoints; i++) {
        const actual = Math.random() * 100;
        const noise = (Math.random() - 0.5) * mae * 4; // Noise based on MAE
        const predicted = actual * Math.sqrt(r2Score) + noise;
        points.push({ actual, predicted });
    }
    
    // Set up plot area
    const padding = 60;
    const plotWidth = canvas.width - 2 * padding;
    const plotHeight = canvas.height - 2 * padding;
    
    // Find min/max for scaling
    const minVal = 0;
    const maxVal = 100;
    
    // Clear and set background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.fillStyle = '#0078d4';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Actual vs Predicted Values', canvas.width / 2, 25);
    
    // Draw axes
    ctx.strokeStyle = '#0078d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw perfect prediction line (diagonal)
    ctx.strokeStyle = '#cce7f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, padding);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw points
    ctx.fillStyle = '#0078d4';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    points.forEach(point => {
        const x = padding + (point.actual / maxVal) * plotWidth;
        const y = canvas.height - padding - (point.predicted / maxVal) * plotHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });
    
    // Draw axis labels
    ctx.fillStyle = '#0078d4';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // X-axis label
    ctx.fillText('Actual Values', canvas.width / 2, canvas.height - 15);
    
    // Y-axis label (rotated)
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('Predicted Values', 0, 0);
    ctx.restore();
    
    // Add legend for perfect prediction line
    ctx.fillStyle = '#0078d4';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Perfect Prediction', canvas.width - 140, 45);
    
    // Draw legend line
    ctx.strokeStyle = '#cce7f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(canvas.width - 150, 40);
    ctx.lineTo(canvas.width - 120, 40);
    ctx.stroke();
    ctx.setLineDash([]);
}

function updateChildJobModelContent() {
    const modelInfo = document.getElementById('child-model-info');
    
    if (!currentChildJobDetails) {
        modelInfo.innerHTML = `
            <div class="no-data-message">
                <span class="no-data-icon">ℹ</span>
                <span>No model information available</span>
            </div>
        `;
        return;
    }
    
    // Display model information
    const primaryMetric = currentJobDetails?.primaryMetric || 'auc';
    const primaryMetricDisplay = getMetricDisplayName(primaryMetric, currentJobDetails?.taskType);
    const primaryScore = currentChildJobDetails.primary_score || currentChildJobDetails.metrics?.[primaryMetric] || 'N/A';
    const formattedScore = typeof primaryScore === 'number' ? primaryScore.toFixed(4) : primaryScore;
    
    modelInfo.innerHTML = `
        <div class="model-info-section">
            <div class="model-summary">
                <h5>Algorithm: ${currentChildJobDetails.algorithm}</h5>
                <p class="model-description">
                    This model was trained using the ${currentChildJobDetails.algorithm} algorithm.
                </p>
            </div>
            
            <div class="model-performance">
                <h5>Performance</h5>
                <div class="performance-metric">
                    <span class="metric-label">${primaryMetricDisplay}:</span>
                    <span class="metric-value primary-metric">${formattedScore}</span>
                </div>
            </div>
            
            <div class="model-details">
                <h5>Training Details</h5>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Algorithm:</span>
                        <span class="detail-value">${currentChildJobDetails.algorithm}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${currentChildJobDetails.status}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Compute Type:</span>
                        <span class="detail-value">${currentChildJobDetails.computeType || 'Serverless'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Deploy status:</span>
                        <span class="detail-value">${currentChildJobDetails.deployStatus || 'No deployment yet'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}



function backToParentJob() {
    if (currentJobDetails) {
        showJobDetails(currentJobDetails);
    } else {
        console.error('No parent job available');
        // Fallback to jobs page
        showJobsPage();
    }
}

function refreshChildJob() {
    // Placeholder for refresh functionality
    console.log('Refreshing child job:', currentChildJobDetails?.displayName);
}

function updateChildJobsTabContent() {
    const childJobsTab = document.getElementById('child-jobs-tab');
    
    console.log('🔍 DEBUG updateChildJobsTabContent:');
    console.log('  - currentJobDetails:', currentJobDetails);
    console.log('  - childJobs:', currentJobDetails?.childJobs);
    console.log('  - childJobs length:', currentJobDetails?.childJobs?.length);
    
    if (!currentJobDetails || !currentJobDetails.childJobs || currentJobDetails.childJobs.length === 0) {
        // Show empty state if no child jobs
        childJobsTab.innerHTML = `
            <div class="tab-content-placeholder">
                <h4>Child jobs</h4>
                <div class="empty-state">
                    <div class="empty-state-content">
                        <div class="empty-state-icon">📋</div>
                        <h3>No child jobs</h3>
                        <p>Individual model training runs will appear here when algorithms are configured.</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    // Create child jobs table
    childJobsTab.innerHTML = `
        <div class="child-jobs-content">
            <h4>Child jobs</h4>
            <div class="child-jobs-table-container">
                <table class="child-jobs-table">
                    <thead>
                        <tr>
                            <th>Display name</th>
                            <th>Parent Job</th>
                            <th>Compute Type</th>
                            <th>Created on</th>
                            <th>Status</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody id="child-jobs-table-body">
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    const tableBody = document.getElementById('child-jobs-table-body');
    
    // Populate child jobs table
    currentJobDetails.childJobs.forEach(childJob => {
        const row = document.createElement('tr');
        row.className = 'child-job-row';
        
        // Calculate duration
        let duration = 'N/A';
        if (childJob.endTime && childJob.startTime) {
            const durationMs = childJob.endTime - childJob.startTime;
            const durationSeconds = Math.round(durationMs / 1000);
            if (durationSeconds < 60) {
                duration = `${durationSeconds}s`;
            } else {
                const minutes = Math.floor(durationSeconds / 60);
                const seconds = durationSeconds % 60;
                duration = `${minutes}m ${seconds}s`;
            }
        } else if (childJob.status === 'Running') {
            duration = 'Running...';
        }
        
        // Format created date
        const createdDate = childJob.createdOn ? childJob.createdOn.toLocaleString() : 'N/A';
        
        // Determine status class and icon
        let statusClass = 'status-running';
        let statusIcon = '⏳';
        if (childJob.status === 'Completed') {
            statusClass = 'status-completed';
            statusIcon = '✅';
        } else if (childJob.status === 'Failed') {
            statusClass = 'status-failed';
            statusIcon = '❌';
        }
        
        row.innerHTML = `
            <td>
                <div class="child-job-name">
                    <span class="job-icon">🤖</span>
                    <button class="algorithm-link" onclick="navigateToChildJob('${childJob.algorithm.replace(/'/g, "\\'")}', currentJobDetails)" title="View child job details">
                        ${childJob.displayName}
                    </button>
                </div>
            </td>
            <td>${childJob.parentJobName}</td>
            <td>
                <span class="compute-type-tag">${childJob.computeType}</span>
            </td>
            <td>${createdDate}</td>
            <td>
                <span class="child-job-status ${statusClass}">
                    <span class="status-icon">${statusIcon}</span>
                    <span>${childJob.status}</span>
                </span>
            </td>
            <td>${duration}</td>
        `;
        
        // Add error information if failed
        if (childJob.status === 'Failed' && childJob.error) {
            row.title = `Error: ${childJob.error}`;
        }
        
        tableBody.appendChild(row);
    });
}

function updateDataGuardrailsTabContent() {
    const dataGuardrailsTab = document.getElementById('data-guardrails-tab');
    
    if (!currentJobDetails) {
        dataGuardrailsTab.innerHTML = `
            <div class="tab-content-placeholder">
                <h4>Data guardrails</h4>
                <p>No job data available.</p>
            </div>
        `;
        return;
    }

    // Create data guardrails content
    dataGuardrailsTab.innerHTML = `
        <div class="data-guardrails-content">
            <h4>Data guardrails</h4>
            <div class="guardrails-summary">
                <p class="guardrails-description">
                    Data guardrails help ensure your data meets quality standards for machine learning.
                    Below are the checks performed on your dataset:
                </p>
            </div>
            
            <div class="guardrails-sections">
                <div class="guardrail-section">
                    <h5>Missing Data Analysis</h5>
                    <div id="missing-data-analysis" class="guardrail-content">
                    </div>
                </div>
                
                <div class="guardrail-section">
                    <h5>Data Quality Summary</h5>
                    <div id="data-quality-summary" class="guardrail-content">
                    </div>
                </div>
                
                <div class="guardrail-section">
                    <h5>Configuration Applied</h5>
                    <div id="configuration-applied" class="guardrail-content">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Populate missing data analysis
    populateMissingDataAnalysis();
    
    // Populate data quality summary
    populateDataQualitySummary();
    
    // Populate configuration applied
    populateConfigurationApplied();
}

function populateMissingDataAnalysis() {
    const analysisDiv = document.getElementById('missing-data-analysis');
    
    // Debug: Log what we have available
    console.log('🔍 Data Guardrails Debug:');
    console.log('  currentJobDetails:', currentJobDetails);
    console.log('  currentJobDetails.datasetInfo:', currentJobDetails ? currentJobDetails.datasetInfo : 'N/A');
    console.log('  uploadedDataFiles length:', uploadedDataFiles ? uploadedDataFiles.length : 0);
    
    // Get dataset information from the job
    let datasetInfo = null;
    
    // Try to get dataset info from the current job details
    if (currentJobDetails && currentJobDetails.datasetInfo) {
        datasetInfo = currentJobDetails.datasetInfo;
        console.log('  ✓ Using job datasetInfo');
    } else if (uploadedDataFiles && uploadedDataFiles.length > 0) {
        // Fallback to uploaded files
        const lastFile = uploadedDataFiles[uploadedDataFiles.length - 1];
        if (lastFile && (lastFile.preview || lastFile.data)) {
            datasetInfo = lastFile;
            console.log('  ✓ Using uploadedDataFiles fallback');
        }
    }
    
    console.log('  Final datasetInfo for analysis:', datasetInfo);
    
    if (!datasetInfo || (!datasetInfo.preview && !datasetInfo.data)) {
        analysisDiv.innerHTML = `
            <div class="guardrail-item">
                <div class="guardrail-status warning">
                    <span class="status-icon">⚠️</span>
                    <span>Dataset analysis not available</span>
                </div>
                <div class="guardrail-details">
                    <p>Unable to analyze missing data - dataset information not found.</p>
                    <p><small>Debug info: datasetInfo=${!!datasetInfo}, preview=${!!(datasetInfo && datasetInfo.preview)}, data=${!!(datasetInfo && datasetInfo.data)}</small></p>
                </div>
            </div>
        `;
        return;
    }
    
    // Analyze missing data from the dataset
    const data = datasetInfo.preview || datasetInfo.data || [];
    const columns = datasetInfo.finalColumns || datasetInfo.columns || [];
    const totalRows = data.length;
    
    if (totalRows === 0) {
        analysisDiv.innerHTML = `
            <div class="guardrail-item">
                <div class="guardrail-status error">
                    <span class="status-icon">❌</span>
                    <span>Empty dataset</span>
                </div>
                <div class="guardrail-details">
                    <p>The dataset contains no data rows.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Calculate missing data for each column
    const missingDataAnalysis = {};
    let totalMissingValues = 0;
    
    columns.forEach(column => {
        let missingCount = 0;
        data.forEach(row => {
            const value = row[column];
            if (value === null || value === undefined || value === '' || 
                (typeof value === 'string' && (value.trim() === '' || value.toLowerCase() === 'null' || value.toLowerCase() === 'na' || value === 'NaN'))) {
                missingCount++;
            }
        });
        
        missingDataAnalysis[column] = {
            missingCount: missingCount,
            missingPercentage: ((missingCount / totalRows) * 100).toFixed(2)
        };
        totalMissingValues += missingCount;
    });
    
    // Generate missing data report
    const columnsWithMissingData = Object.entries(missingDataAnalysis)
        .filter(([column, analysis]) => analysis.missingCount > 0);
    
    let html = '';
    
    if (columnsWithMissingData.length === 0) {
        html = `
            <div class="guardrail-item">
                <div class="guardrail-status success">
                    <span class="status-icon">✅</span>
                    <span>No missing data detected</span>
                </div>
                <div class="guardrail-details">
                    <p>All ${columns.length} columns have complete data across ${totalRows} rows.</p>
                </div>
            </div>
        `;
    } else {
        const overallMissingPercentage = ((totalMissingValues / (totalRows * columns.length)) * 100).toFixed(2);
        
        html = `
            <div class="guardrail-item">
                <div class="guardrail-status ${overallMissingPercentage > 20 ? 'error' : overallMissingPercentage > 5 ? 'warning' : 'info'}">
                    <span class="status-icon">${overallMissingPercentage > 20 ? '❌' : overallMissingPercentage > 5 ? '⚠️' : 'ℹ️'}</span>
                    <span>Missing data found in ${columnsWithMissingData.length} column(s)</span>
                </div>
                <div class="guardrail-details">
                    <p><strong>Overall missing data:</strong> ${overallMissingPercentage}% of all values</p>
                    <div class="missing-data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Column</th>
                                    <th>Missing Count</th>
                                    <th>Missing %</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        columnsWithMissingData.forEach(([column, analysis]) => {
            const percentage = parseFloat(analysis.missingPercentage);
            const statusClass = percentage > 50 ? 'error' : percentage > 20 ? 'warning' : 'info';
            const statusText = percentage > 50 ? 'High' : percentage > 20 ? 'Medium' : 'Low';
            
            html += `
                <tr>
                    <td><code>${column}</code></td>
                    <td>${analysis.missingCount} / ${totalRows}</td>
                    <td>${analysis.missingPercentage}%</td>
                    <td><span class="missing-status ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    analysisDiv.innerHTML = html;
}

function populateDataQualitySummary() {
    const summaryDiv = document.getElementById('data-quality-summary');
    
    // Get dataset information from the current job details
    let datasetInfo = null;
    if (currentJobDetails && currentJobDetails.datasetInfo) {
        datasetInfo = currentJobDetails.datasetInfo;
    } else if (uploadedDataFiles && uploadedDataFiles.length > 0) {
        // Fallback to uploaded files
        const lastFile = uploadedDataFiles[uploadedDataFiles.length - 1];
        if (lastFile && lastFile.data) {
            datasetInfo = lastFile;
        }
    }
    
    if (!datasetInfo) {
        summaryDiv.innerHTML = `
            <div class="guardrail-item">
                <div class="guardrail-status info">
                    <span class="status-icon">ℹ️</span>
                    <span>Dataset summary not available</span>
                </div>
            </div>
        `;
        return;
    }
    
    const data = datasetInfo ? (datasetInfo.preview || datasetInfo.data || []) : [];
    const columns = datasetInfo ? (datasetInfo.finalColumns || datasetInfo.columns || []) : [];
    const totalRows = data.length;
    const totalColumns = columns.length;
    const targetColumn = currentJobDetails.targetColumn;
    
    summaryDiv.innerHTML = `
        <div class="guardrail-item">
            <div class="guardrail-status success">
                <span class="status-icon">📊</span>
                <span>Dataset Overview</span>
            </div>
            <div class="guardrail-details">
                <div class="data-summary-grid">
                    <div class="summary-item">
                        <strong>Total Rows:</strong> ${totalRows.toLocaleString()}
                    </div>
                    <div class="summary-item">
                        <strong>Total Columns:</strong> ${totalColumns}
                    </div>
                    <div class="summary-item">
                        <strong>Target Column:</strong> <code>${targetColumn || 'Not specified'}</code>
                    </div>
                    <div class="summary-item">
                        <strong>Task Type:</strong> ${currentJobDetails.taskType || 'Not specified'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function populateConfigurationApplied() {
    const configDiv = document.getElementById('configuration-applied');
    
    const missingDataStrategy = currentJobDetails.missingDataStrategy || 'remove';
    const normalizeFeatures = currentJobDetails.normalizeFeatures || false;
    
    configDiv.innerHTML = `
        <div class="guardrail-item">
            <div class="guardrail-status info">
                <span class="status-icon">⚙️</span>
                <span>Data Processing Configuration</span>
            </div>
            <div class="guardrail-details">
                <div class="config-list">
                    <div class="config-item">
                        <strong>Missing Data Strategy:</strong> 
                        <span class="config-value">
                            ${missingDataStrategy === 'remove' ? 'Remove rows with missing values' : 'Fill missing values (imputation)'}
                        </span>
                    </div>
                    <div class="config-item">
                        <strong>Feature Normalization:</strong> 
                        <span class="config-value">${normalizeFeatures ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div class="config-item">
                        <strong>Primary Metric:</strong> 
                        <span class="config-value">${currentJobDetails.primaryMetric || 'Default'}</span>
                    </div>
                </div>
                
                <div class="config-recommendations">
                    <h6>Recommendations:</h6>
                    <ul>
                        ${missingDataStrategy === 'remove' ? 
                            '<li>Removing rows with missing values may reduce dataset size. Consider imputation if missing data is significant.</li>' :
                            '<li>Imputation strategy will fill missing values. Ensure this aligns with your data characteristics.</li>'
                        }
                        ${normalizeFeatures ? 
                            '<li>Feature normalization is enabled, which is recommended for most algorithms.</li>' :
                            '<li>Consider enabling feature normalization for better model performance with algorithms sensitive to scale.</li>'
                        }
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function navigateToAutoML() {
    // Hide job details page
    document.getElementById('job-details-page').style.display = 'none';
    
    // Show automl page using the standard navigation function
    showAutoMLPage();
}

// Model name validation functions
function validateModelName() {
    const modelNameInput = document.getElementById('modelName');
    const modelName = modelNameInput.value.trim();
    
    // Check if name is empty
    if (!modelName) {
        showModelNameError('Model name is required');
        disableRegisterButton();
        return false;
    }
    
    // Check if a model with this name already exists
    const existingModel = registeredModels.find(model => 
        model.name.toLowerCase() === modelName.toLowerCase()
    );
    
    if (existingModel) {
        showModelNameError(`A model with the name "${modelName}" already exists`);
        disableRegisterButton();
        return false;
    }
    
    // Name is valid
    clearModelNameError();
    enableRegisterButton();
    return true;
}

function showModelNameError(message) {
    const errorDiv = document.getElementById('modelNameError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function clearModelNameError() {
    const errorDiv = document.getElementById('modelNameError');
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

function enableRegisterButton() {
    const button = document.getElementById('registerModelButton');
    if (button) {
        button.disabled = false;
        button.style.opacity = '1';
        button.title = 'Register model from this completed job';
    }
}

function disableRegisterButton() {
    const button = document.getElementById('registerModelButton');
    if (button) {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.title = 'Job must be completed to register a model';
    }
}

function setupModelRegistrationModal() {
    // Add event listeners for real-time validation
    const modelNameInput = document.getElementById('modelName');
    if (modelNameInput) {
        // Remove existing listeners to avoid duplicates
        modelNameInput.removeEventListener('input', validateModelName);
        modelNameInput.removeEventListener('blur', validateModelName);
        modelNameInput.removeEventListener('keydown', handleModelNameKeydown);
        
        // Add new listeners
        modelNameInput.addEventListener('input', validateModelName);
        modelNameInput.addEventListener('blur', validateModelName);
        modelNameInput.addEventListener('keydown', handleModelNameKeydown);
    }
    
    // Initial button state - start disabled until valid input
    disableRegisterButton();
}

function handleModelNameKeydown(event) {
    // Check if Enter key was pressed
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        event.stopPropagation(); // Stop event bubbling
        
        // Only trigger register if model name is valid
        if (validateModelName()) {
            // Click the register button
            const registerButton = document.getElementById('registerModelButton');
            if (registerButton && !registerButton.disabled) {
                registerButton.click();
            }
        }
        
        return false; // Additional prevention of form submission
    }
}

// Job action functions (placeholder implementations)
function editAndResubmit() {
    alert('Edit and resubmit functionality will be implemented in a future version.');
}

function registerModel() {
    // Get the current job from global variable
    const job = currentJobDetails;
    
    if (!job) {
        console.error('No job selected for model registration');
        return;
    }

    // Find the job index in jobHistory
    const jobIndex = jobHistory.findIndex(j => j.id === job.id);
    
    currentRegistrationContext = {
        type: 'parent',
        job: job,
        jobIndex: jobIndex
    };
    
    // Populate model selection dropdown with all child models
    const modelSelection = document.getElementById('modelSelection');
    modelSelection.innerHTML = '';
    
    if (job && job.childJobs && job.childJobs.length > 0) {
        // Add options for all models, find best model from existing data
        job.childJobs.forEach((childJob, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${childJob.algorithm} (${job.primaryMetric}: ${childJob.metrics[job.primaryMetric]})`;
            
            // Check if this model corresponds to the best model
            if (job.models && job.models.length > 0) {
                const correspondingModel = job.models.find(m => m.name === childJob.algorithm);
                if (correspondingModel && correspondingModel.is_best) {
                    option.selected = true;
                    option.textContent += ' - Best Model';
                }
            }
            
            modelSelection.appendChild(option);
        });
    }
    
    // Clear the name field and reset validation
    const modelNameInput = document.getElementById('modelName');
    if (modelNameInput) {
        modelNameInput.value = '';
    }
    
    // Setup validation
    setupModelRegistrationModal();
    
    // Reset error state
    clearModelNameError();
    disableRegisterButton(); // Start with button disabled
    
    // Show the modal
    const registerModal = document.getElementById('registerModelModal');
    if (registerModal) {
        registerModal.style.display = 'block';
    } else {
        console.error('registerModelModal not found!');
    }
}

function registerChildModel() {
    // Get the current job and child job from global variables
    const job = currentJobDetails;
    const childJob = currentChildJobDetails;
    
    if (!job || !job.status.startsWith('Completed')) {
        alert('Job must be completed to register a model.');
        return;
    }
    
    if (!childJob) {
        alert('No child job selected.');
        return;
    }

    // Find the job index in jobHistory
    const jobIndex = jobHistory.findIndex(j => j.id === job.id);
    
    currentRegistrationContext = {
        type: 'child',
        job: job,
        childJob: childJob,
        jobIndex: jobIndex
    };
    
    // Populate model selection dropdown with just this model
    const modelSelection = document.getElementById('modelSelection');
    modelSelection.innerHTML = '';
    
    // Find the index of the current child job
    const childJobIndex = job.childJobs ? job.childJobs.indexOf(childJob) : 0;
    
    const option = document.createElement('option');
    option.value = childJobIndex;
    option.textContent = `${childJob.algorithm} (${job.primaryMetric}: ${childJob.metrics ? childJob.metrics[job.primaryMetric] : 'N/A'})`;
    option.selected = true;
    modelSelection.appendChild(option);
    
    // Clear the name field
    const modelNameInput = document.getElementById('modelName');
    if (modelNameInput) {
        modelNameInput.value = '';
    }
    
    // Setup validation and event listeners
    setupModelRegistrationModal();
    
    // Show the modal
    const registerModal = document.getElementById('registerModelModal');
    if (registerModal) {
        registerModal.style.display = 'block';
    }
}

function deployChildModel() {
    // Get the current child job
    const childJob = currentChildJobDetails;
    
    if (!childJob) {
        alert('No child job selected.');
        return;
    }
    
    if (!childJob.status.startsWith('Completed')) {
        alert('Job must be completed to deploy the model.');
        return;
    }
    
    // Set deployment source
    deploymentSource = 'child-job';
    
    // Generate default names based on child job
    const jobName = childJob.displayName || childJob.id || 'model';
    const defaultEndpointName = `${jobName}-endpoint`;
    const defaultDeploymentName = `${jobName}-deployment`;
    
    // Populate the form fields
    document.getElementById('endpointName').value = defaultEndpointName;
    document.getElementById('deploymentName').value = defaultDeploymentName;
    
    // Show the deploy model flyout
    const flyout = document.getElementById('deployModelFlyout');
    flyout.style.display = 'block';
    // Add slight delay to ensure display is set before adding open class for animation
    setTimeout(() => {
        flyout.classList.add('open');
    }, 10);
}

function downloadChildModel() {
    // Get the current child job
    const childJob = currentChildJobDetails;
    
    if (!childJob) {
        alert('No child job selected.');
        return;
    }
    
    if (!childJob.status.startsWith('Completed')) {
        alert('Job must be completed to download the model.');
        return;
    }
    
    // Use PyScript to serialize the real trained model
    if (!window.serialize_model_pyscript) {
        alert('PyScript model serialization not available. Please wait for PyScript to load.');
        return;
    }
    
    try {
        // Create the model key based on parent job ID and algorithm
        const modelKey = `${childJob.parentJobId}_${childJob.algorithm}`;
        console.log('Serializing real scikit-learn model for child job:', childJob.displayName, 'with key:', modelKey);
        
        const serializedModelB64 = window.serialize_model_pyscript(modelKey);
        
        // Check if there was an error
        if (serializedModelB64.startsWith('{"error":')) {
            const errorInfo = JSON.parse(serializedModelB64);
            throw new Error(errorInfo.error);
        }
        
        // Convert base64 to binary data for download
        const binaryString = atob(serializedModelB64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const modelName = `${childJob.displayName || childJob.id}_model.pkl`;
        downloadFile(bytes, modelName, 'application/octet-stream');
        
        console.log('Downloaded real scikit-learn model for child job:', childJob);
    } catch (error) {
        console.error('Error downloading real model:', error);
        alert(`Error downloading model: ${error.message}`);
    }
}

function closeRegisterModelModal() {
    const registerModal = document.getElementById('registerModelModal');
    if (registerModal) {
        registerModal.style.display = 'none';
    }
    
    // Clear form and validation state
    const modelNameInput = document.getElementById('modelName');
    if (modelNameInput) {
        modelNameInput.value = '';
    }
    clearModelNameError();
    
    currentRegistrationContext = null;
}

function completeModelRegistration() {
    const modelName = document.getElementById('modelName').value.trim();
    const selectedModelIndex = parseInt(document.getElementById('modelSelection').value);
    
    // Validate model name before proceeding
    if (!validateModelName()) {
        return;
    }
    
    if (!currentRegistrationContext) {
        alert('Registration context not found');
        return;
    }
    
    const { job, jobIndex } = currentRegistrationContext;
    const childJob = job.childJobs[selectedModelIndex];
    
    // Create registered model entry
    const registeredModel = {
        id: registeredModels.length + 1,
        name: modelName,
        algorithm: childJob.algorithm,
        metrics: { ...childJob.metrics },
        primaryMetric: job.primaryMetric,
        sourceJob: job.name,
        sourceJobId: jobIndex,
        childJobIndex: selectedModelIndex,
        createdDate: new Date().toISOString(),
        status: 'Registered',
        datasetInfo: job.datasetInfo, // Store dataset information
        targetColumn: job.targetColumn, // Store target column
        modelKey: `${job.id}_${childJob.algorithm}` // Exact key to find the trained model
    };
    
    registeredModels.push(registeredModel);
    
    // Update the deployed models list
    updateDeployedModelsList();
    
    // Close modal
    closeRegisterModelModal();
    
    // Navigate to Model Details page
    showModelDetails(registeredModel);
}

function updateDeployedModelsList() {
    const deployedModelsList = document.getElementById('deployed-models-list');
    
    // Check if the element exists (user might not be on the Models page)
    if (!deployedModelsList) {
        return;
    }
    
    if (registeredModels.length === 0) {
        deployedModelsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-content">
                    <h3>No models registered yet.</h3>
                    <p>Register models from training results to see them here.</p>
                </div>
            </div>
        `;
        return;
    }
    
    deployedModelsList.innerHTML = `
        <table class="models-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Job</th>
                    <th>Created On</th>
                </tr>
            </thead>
            <tbody>
                ${registeredModels.map(model => `
                    <tr onclick="showModelDetails(registeredModels[${model.id - 1}])">
                        <td><span class="model-name">${model.name}</span></td>
                        <td><span class="model-type">Scikit-Learn</span></td>
                        <td><a href="#" class="model-job" onclick="event.stopPropagation(); showJobDetailsFromModel(${model.sourceJobId})">${model.sourceJob}</a></td>
                        <td><span class="model-created">${formatDateTime(model.createdDate)}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options);
}

function updateEndpointsList() {
    const endpointsList = document.getElementById('endpoints-list');
    
    // Check if the element exists (user might not be on the Endpoints page)
    if (!endpointsList) {
        return;
    }
    
    if (deployedEndpoints.length === 0) {
        endpointsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-content">
                    <h3>No endpoints deployed yet.</h3>
                    <p>Deploy models to create endpoints for real-time inference.</p>
                </div>
            </div>
        `;
        return;
    }
    
    endpointsList.innerHTML = `
        <table class="endpoints-table">
            <thead>
                <tr>
                    <th>Endpoint Name</th>
                    <th>Model</th>
                    <th>Status</th>
                    <th>Created On</th>
                </tr>
            </thead>
            <tbody>
                ${deployedEndpoints.map(endpoint => `
                    <tr onclick="showEndpointDetails('${endpoint.id}')">
                        <td><span class="endpoint-name">${endpoint.endpointName}</span></td>
                        <td><span class="endpoint-model">${endpoint.modelName}</span></td>
                        <td><span class="endpoint-status">Active</span></td>
                        <td><span class="endpoint-created">${formatDateTime(endpoint.createdAt)}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showModelDetails(model) {
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    
    // Show model details page
    document.getElementById('model-details-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showModelsPage()"]').classList.add('active');
    
    // Populate model details
    document.getElementById('model-details-title').textContent = model.name;
    
    // Populate model attributes
    document.getElementById('model-attr-name').textContent = model.name;
    document.getElementById('model-attr-created').textContent = new Date(model.createdDate).toLocaleDateString();
    document.getElementById('model-attr-type').textContent = model.framework || 'scikit-learn';
    document.getElementById('model-attr-job').textContent = model.sourceJob;
    
    // Make the job link clickable
    document.getElementById('model-attr-job').onclick = () => showJobDetailsFromModel(model.sourceJobId);
}

function refreshModelDetails() {
    // Refresh model details - simulate reload
    const currentModel = registeredModels.find(m => m.name === document.getElementById('model-details-title').textContent);
    if (currentModel) {
        showModelDetails(currentModel);
    }
}

function useThisModel() {
    const modelName = document.getElementById('model-details-title').textContent;
    
    // Set deployment source
    deploymentSource = 'model-details';
    
    // Set default values for endpoint and deployment names
    const defaultEndpointName = `${modelName}-endpoint`;
    const defaultDeploymentName = `${modelName}-deployment`;
    
    // Populate the form fields
    document.getElementById('endpointName').value = defaultEndpointName;
    document.getElementById('deploymentName').value = defaultDeploymentName;
    
    // Show the deploy model flyout
    const flyout = document.getElementById('deployModelFlyout');
    flyout.style.display = 'block';
    // Add slight delay to ensure display is set before adding open class for animation
    setTimeout(() => {
        flyout.classList.add('open');
    }, 10);
}

function closeDeployModelFlyout() {
    const flyout = document.getElementById('deployModelFlyout');
    flyout.classList.remove('open');
    // Wait for animation to complete before hiding
    setTimeout(() => {
        flyout.style.display = 'none';
        // Clear form fields
        document.getElementById('endpointName').value = '';
        document.getElementById('deploymentName').value = '';
        // Reset deployment source
        deploymentSource = null;
    }, 300);
}

function completeModelDeployment() {
    const endpointName = document.getElementById('endpointName').value.trim();
    const deploymentName = document.getElementById('deploymentName').value.trim();
    
    // Validate required fields
    if (!endpointName) {
        alert('Please enter an endpoint name.');
        return;
    }
    
    if (!deploymentName) {
        alert('Please enter a deployment name.');
        return;
    }
    
    let modelName;
    
    if (deploymentSource === 'model-details') {
        // Deploying from model details page - model is already registered
        modelName = document.getElementById('model-details-title').textContent;
    } else if (deploymentSource === 'child-job') {
        // Deploying from child job - may need to register model first
        const childJob = currentChildJobDetails;
        const jobName = childJob.displayName || childJob.id || 'model';
        
        // Check if model is already registered
        const existingModel = registeredModels.find(model => 
            model.sourceJobId === childJob.id || model.sourceJob === jobName
        );
        
        if (existingModel) {
            modelName = existingModel.name;
        } else {
            // Register the model first with unique name
            const baseModelName = jobName;
            let modelCounter = 1;
            let uniqueModelName = `${baseModelName}-${modelCounter}`;
            
            // Ensure unique name
            while (registeredModels.find(model => model.name === uniqueModelName)) {
                modelCounter++;
                uniqueModelName = `${baseModelName}-${modelCounter}`;
            }
            
            // Create new registered model
            const newRegisteredModel = {
                id: registeredModels.length + 1,
                name: uniqueModelName,
                sourceJob: jobName,
                sourceJobId: childJob.id,
                createdDate: new Date().toISOString(),
                algorithm: childJob.algorithm || 'Unknown',
                metrics: childJob.metrics || {},
                datasetInfo: childJob.datasetInfo, // Store dataset information
                targetColumn: childJob.targetColumn, // Store target column
                modelKey: `${childJob.parentJobId}_${childJob.algorithm}` // Exact key to find the trained model
            };
            
            registeredModels.push(newRegisteredModel);
            updateDeployedModelsList();
            
            modelName = uniqueModelName;
        }
    }
    
    // Find the registered model to get the model key
    const registeredModel = registeredModels.find(model => model.name === modelName);
    const modelKey = registeredModel ? registeredModel.modelKey : null;
    
    // Create new endpoint
    const newEndpoint = {
        id: `endpoint-${Date.now()}`,
        endpointName: endpointName,
        deploymentName: deploymentName,
        modelName: modelName,
        modelKey: modelKey, // Store the exact model key for precise identification
        createdAt: new Date().toISOString(),
        status: 'Active'
    };
    
    // Add to deployed endpoints
    deployedEndpoints.push(newEndpoint);
    
    // Update deploy status for child job if deploying from child job
    if (deploymentSource === 'child-job' && currentChildJobDetails) {
        currentChildJobDetails.deployStatus = 'Deployed';
        
        // Also update the child job in the parent job's childJobs array if it exists
        if (currentJobDetails && currentJobDetails.childJobs) {
            const childJob = currentJobDetails.childJobs.find(cj => cj.id === currentChildJobDetails.id);
            if (childJob) {
                childJob.deployStatus = 'Deployed';
            }
        }
        
        // Refresh the current child job model content to show updated deploy status
        updateChildJobModelContent();
    }
    
    // Close the flyout
    closeDeployModelFlyout();
    
    // Reset deployment source
    deploymentSource = null;
    
    // Update endpoints list
    updateEndpointsList();
    
    // Show success alert instead of navigating to endpoint details
    alert(`Model has been successfully deployed!\n\nEndpoint: ${endpointName}\nDeployment: ${deploymentName}\nModel: ${modelName}`);
}

function showEndpointDetails(endpointId) {
    // Find the endpoint
    const endpoint = deployedEndpoints.find(ep => ep.id === endpointId);
    if (!endpoint) {
        alert('Endpoint not found.');
        return;
    }
    
    // Hide all pages and show endpoint details page
    document.querySelectorAll('.page-content').forEach(page => page.style.display = 'none');
    document.getElementById('endpoint-details-page').style.display = 'block';
    
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector('.nav-item[onclick="showEndpointsPage()"]').classList.add('active');
    
    // Populate endpoint details
    document.getElementById('endpoint-details-title').textContent = endpoint.endpointName;
    document.getElementById('endpoint-name-display').textContent = endpoint.endpointName;
    document.getElementById('deployment-name-display').textContent = endpoint.deploymentName;
    document.getElementById('deployed-model-display').textContent = endpoint.modelName;
    document.getElementById('endpoint-created-display').textContent = formatDateTime(endpoint.createdAt);
    document.getElementById('endpoint-url').textContent = `https://${endpoint.endpointName.toLowerCase()}.azureml.net/score`;
    
    // Set up test input placeholder based on model
    const testInput = document.getElementById('test-input-data');
    
    // Try to get the model's feature columns
    const registeredModel = registeredModels.find(model => model.name === endpoint.modelName);
    let featureColumns = [];
    
    console.log('🔍 DEBUG: Getting feature columns for endpoint:', endpoint.modelName);
    console.log('  registeredModel:', registeredModel);
    
    if (registeredModel && registeredModel.datasetInfo) {
        console.log('  datasetInfo:', registeredModel.datasetInfo);
        console.log('  targetColumn:', registeredModel.targetColumn);
        
        // Get feature columns from the model's dataset info
        if (registeredModel.datasetInfo.columns || registeredModel.datasetInfo.finalColumns) {
            const allColumns = registeredModel.datasetInfo.finalColumns || registeredModel.datasetInfo.columns;
            console.log('  allColumns:', allColumns);
            // Get all columns except the target column
            featureColumns = allColumns.filter(col => col !== registeredModel.targetColumn);
            console.log('  featureColumns (after filtering target):', featureColumns);
        }
    } else {
        console.log('  No model found or no dataset info available');
    }
    
    // If we couldn't get the actual columns, use defaults
    if (featureColumns.length === 0) {
        featureColumns = ["feature1", "feature2", "feature3"];
        console.log('  Using default feature columns:', featureColumns);
    }
    
    // Create the JSON in the requested format
    const testJson = {
        input_data: {
            columns: featureColumns,
            index: [],
            data: []
        }
    };
    
    // Set the textarea value to the formatted JSON (editable)
    testInput.value = JSON.stringify(testJson, null, 2);
    
    // Clear any placeholder text since we're setting actual content
    testInput.placeholder = '';
    
    // Update the Python code example with actual feature names
    updateConsumeCodeExample(featureColumns, registeredModel);
    
    // Show details tab by default
    showEndpointTab('details');
}

function backToEndpointsList() {
    showEndpointsPage();
}

function refreshEndpointDetails() {
    // Simulate refresh
    alert('Endpoint details refreshed.');
}

function showEndpointTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`endpoint-${tabName}-tab`).style.display = 'block';
    document.getElementById(`endpoint-${tabName}-tab`).classList.add('active');
    
    // Add active class to selected tab button
    event.target.classList.add('active');
}

function testEndpoint() {
    const testData = document.getElementById('test-input-data').value.trim();
    const resultsDiv = document.getElementById('test-results');
    const responseDiv = document.getElementById('test-response');
    
    if (!testData) {
        alert('Please enter test data in JSON format.');
        return;
    }
    
    try {
        // Validate JSON
        const inputData = JSON.parse(testData);
        
        // Get the current endpoint to find the model
        const currentEndpoint = deployedEndpoints.find(ep => 
            document.getElementById('endpoint-name-display').textContent === ep.endpointName
        );
        
        if (!currentEndpoint) {
            throw new Error('Could not find endpoint information');
        }
        
        // Show loading state
        responseDiv.innerHTML = '<div style="color: #666;">Making prediction...</div>';
        resultsDiv.style.display = 'block';
        
        // Call PyScript prediction function
        if (window.predict_with_model_pyscript) {
            try {
                // Use the exact model key from the endpoint for precise model identification
                const modelIdentifier = currentEndpoint.modelKey || currentEndpoint.modelName;
                console.log('Using model identifier:', modelIdentifier);
                
                const predictionResult = window.predict_with_model_pyscript(
                    modelIdentifier,
                    testData
                );
                
                // Parse the result
                const predictions = JSON.parse(predictionResult);
                
                if (predictions.error) {
                    throw new Error(predictions.error);
                }
                
                // Display predictions in the requested format
                responseDiv.innerHTML = `<pre>${JSON.stringify(predictions, null, 2)}</pre>`;
                
            } catch (pyError) {
                // Enhanced error message for data format issues
                let errorMsg = `Prediction failed: ${pyError.message}`;
                if (pyError.message.includes('ValueError') || pyError.message.includes('columns') || pyError.message.includes('data')) {
                    errorMsg += '\n\nTip: Make sure your data matches the format expected by the model:\n';
                    errorMsg += '• Categorical values should be encoded as numbers (0, 1, 2, etc.)\n';
                    errorMsg += '• Use the same data types and preprocessing as during training\n';
                    errorMsg += '• Check that column names and order match exactly';
                }
                throw new Error(errorMsg);
            }
        } else {
            throw new Error('PyScript prediction function not available. Please wait for PyScript to load.');
        }
        
    } catch (error) {
        console.error('Test endpoint error:', error);
        responseDiv.innerHTML = `<div style="color: #d73a49; padding: 10px; background: #ffeef0; border-radius: 4px; white-space: pre-wrap;">${error.message}</div>`;
        resultsDiv.style.display = 'block';
    }
}

function downloadModel() {
    const modelName = document.getElementById('model-details-title').textContent;
    
    // Find the registered model data
    const registeredModel = registeredModels.find(model => model.name === modelName);
    
    if (!registeredModel) {
        alert('Model data not found.');
        return;
    }
    
    // Use PyScript to serialize the real trained model
    if (!window.serialize_model_pyscript) {
        alert('PyScript model serialization not available. Please wait for PyScript to load.');
        return;
    }
    
    try {
        // Use the exact model key for precise model identification
        const modelIdentifier = registeredModel.modelKey || modelName;
        console.log('Serializing real scikit-learn model:', modelName, 'with key:', modelIdentifier);
        const serializedModelB64 = window.serialize_model_pyscript(modelIdentifier);
        
        // Check if there was an error
        if (serializedModelB64.startsWith('{"error":')) {
            const errorInfo = JSON.parse(serializedModelB64);
            throw new Error(errorInfo.error);
        }
        
        // Convert base64 to binary data for download
        const binaryString = atob(serializedModelB64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const fileName = `${modelName.replace(/[^a-zA-Z0-9-_]/g, '_')}_model.pkl`;
        downloadFile(bytes, fileName, 'application/octet-stream');
        
        console.log('Downloaded real scikit-learn model:', modelName);
    } catch (error) {
        console.error('Error downloading real model:', error);
        alert(`Error downloading model: ${error.message}`);
    }
}

function downloadEndpointModel() {
    // Get the current endpoint's model name
    const modelName = document.getElementById('deployed-model-display').textContent;
    
    if (!modelName) {
        alert('No model information available.');
        return;
    }
    
    // Find the registered model data
    const registeredModel = registeredModels.find(model => model.name === modelName);
    
    if (!registeredModel) {
        alert('Model data not found.');
        return;
    }
    
    // Use PyScript to serialize the real trained model
    if (!window.serialize_model_pyscript) {
        alert('PyScript model serialization not available. Please wait for PyScript to load.');
        return;
    }
    
    try {
        // Use the exact model key for precise model identification
        const modelIdentifier = registeredModel.modelKey || modelName;
        console.log('Downloading real scikit-learn model from endpoint:', modelName, 'with key:', modelIdentifier);
        const serializedModelB64 = window.serialize_model_pyscript(modelIdentifier);
        
        // Check if there was an error
        if (serializedModelB64.startsWith('{"error":')) {
            const errorInfo = JSON.parse(serializedModelB64);
            throw new Error(errorInfo.error);
        }
        
        // Convert base64 to binary data for download
        const binaryString = atob(serializedModelB64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const fileName = `${modelName.replace(/[^a-zA-Z0-9-_]/g, '_')}_model.pkl`;
        downloadFile(bytes, fileName, 'application/octet-stream');
        
        console.log('Downloaded real scikit-learn model from endpoint:', modelName);
    } catch (error) {
        console.error('Error downloading model from endpoint:', error);
        alert(`Error downloading model: ${error.message}`);
    }
}

function updateConsumeCodeExample(featureColumns, registeredModel) {
    const codeElement = document.getElementById('example-python-code');
    
    if (!codeElement) return;
    
    // Try to get actual sample data from the training dataset
    let sampleDataEntries = [];
    let usedActualData = false;
    
    if (registeredModel && registeredModel.datasetInfo && registeredModel.datasetInfo.preview) {
        console.log('🔍 DEBUG: Found dataset preview:', registeredModel.datasetInfo.preview);
        
        // Find the first complete row (no empty values for feature columns)
        const preview = registeredModel.datasetInfo.preview;
        let sampleRow = null;
        
        for (const row of preview) {
            // Check if this row has values for all feature columns
            const hasAllFeatures = featureColumns.every(col => 
                row[col] !== undefined && row[col] !== null && row[col] !== ''
            );
            
            if (hasAllFeatures) {
                sampleRow = row;
                break;
            }
        }
        
        if (sampleRow) {
            console.log('🔍 DEBUG: Using actual data row:', sampleRow);
            usedActualData = true;
            
            sampleDataEntries = featureColumns.map(col => {
                let value = sampleRow[col];
                
                // Format the value appropriately for Python
                if (typeof value === 'string') {
                    // Escape quotes and wrap in quotes for string values
                    const escapedValue = value.replace(/'/g, "\\'").replace(/"/g, '\\"');
                    return `    '${col}': '${escapedValue}'`;
                } else if (typeof value === 'number') {
                    return `    '${col}': ${value}`;
                } else {
                    // Handle other data types or convert to string
                    const stringValue = String(value).replace(/'/g, "\\'").replace(/"/g, '\\"');
                    return `    '${col}': '${stringValue}'`;
                }
            });
        }
    }
    
    // Fallback to generated sample data if we couldn't get actual data
    if (!usedActualData) {
        console.log('🔍 DEBUG: Using generated sample data (no actual data available)');
        
        // Get data type information from the registered model for better generation
        let dtypes = {};
        if (registeredModel && registeredModel.datasetInfo) {
            dtypes = registeredModel.datasetInfo.dtypes || {};
        }
        
        sampleDataEntries = featureColumns.map((col, index) => {
            let sampleValue;
            
            // Check if this column is categorical (object/string type)
            const columnType = dtypes[col];
            const isCategorical = columnType === 'object' || (columnType && columnType.includes('string'));
            
            if (isCategorical) {
                // Generate string sample values for categorical columns
                if (col.toLowerCase().includes('gender')) {
                    sampleValue = "'Male'";
                } else if (col.toLowerCase().includes('category') || col.toLowerCase().includes('type')) {
                    sampleValue = "'Category A'";
                } else if (col.toLowerCase().includes('status')) {
                    sampleValue = "'Active'";
                } else if (col.toLowerCase().includes('grade') || col.toLowerCase().includes('level')) {
                    sampleValue = "'High'";
                } else if (col.toLowerCase().includes('color')) {
                    sampleValue = "'Blue'";
                } else if (col.toLowerCase().includes('region') || col.toLowerCase().includes('location')) {
                    sampleValue = "'North'";
                } else {
                    // Default categorical values
                    const categoricalDefaults = ["'Option A'", "'Type 1'", "'Low'", "'Medium'", "'Category'"];
                    sampleValue = categoricalDefaults[index % categoricalDefaults.length];
                }
            } else {
                // Generate numeric sample values for numeric columns
                if (col.toLowerCase().includes('age')) {
                    sampleValue = 35;
                } else if (col.toLowerCase().includes('price') || col.toLowerCase().includes('cost') || col.toLowerCase().includes('amount')) {
                    sampleValue = 100.50;
                } else if (col.toLowerCase().includes('count') || col.toLowerCase().includes('number')) {
                    sampleValue = 5;
                } else if (col.toLowerCase().includes('rate') || col.toLowerCase().includes('ratio') || col.toLowerCase().includes('percent')) {
                    sampleValue = 0.75;
                } else if (col.toLowerCase().includes('income') || col.toLowerCase().includes('salary')) {
                    sampleValue = 50000;
                } else if (col.toLowerCase().includes('score')) {
                    sampleValue = 85;
                } else {
                    // Default numeric values based on position
                    const defaultValues = [1.0, 2.5, 0.8, 150, 3.2, 42, 0.6, 25.5, 1, 0.9];
                    sampleValue = defaultValues[index % defaultValues.length];
                }
            }
            
            return `    '${col}': ${sampleValue}`;
        });
    }
    
    // Join the sample data entries
    const sampleDataString = sampleDataEntries.join(',\n');
    
    // Get the model filename
    const modelName = document.getElementById('deployed-model-display').textContent || 'your_model';
    const fileName = `${modelName.replace(/[^a-zA-Z0-9-_]/g, '_')}_model.pkl`;
    
    const pythonCode = `import joblib
import pandas as pd
import numpy as np

# Load the downloaded model
model = joblib.load('${fileName}')

# Prepare sample data (replace with your actual feature values)
sample_data = {
${sampleDataString}
}

# Convert to DataFrame
df = pd.DataFrame(sample_data)

# Make prediction
prediction = model.predict(df)
print(f"Prediction: {prediction[0]}")`;

    codeElement.textContent = pythonCode;
}

// DEPRECATED: These functions created fake/mock models and are no longer used
// The app now uses real scikit-learn models stored in PyScript and serialized with pickle

/*
function createSklearnModelData(childJob) {
    // DEPRECATED: This created fake model data, now using real scikit-learn models
    // See serialize_model_pyscript() in PyScript section for real model serialization
}

function createSklearnModelDataFromRegistered(registeredModel) {
    // DEPRECATED: This created fake model data, now using real scikit-learn models  
    // See serialize_model_pyscript() in PyScript section for real model serialization
}
*/

// DEPRECATED: Helper functions for fake model generation - no longer used with real scikit-learn models
/*
function getModelTypeFromAlgorithm(algorithm) { ... }
function generateModelParams(algorithm, metrics) { ... }  
function generateFeatureNames() { ... }
*/

function downloadFile(content, fileName, mimeType) {
    // Create a blob with the content
    const blob = new Blob([content], { type: mimeType });
    
    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    // Add to DOM, click, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
    
    console.log(`Downloaded file: ${fileName}`);
}

function navigateToSourceJob() {
    // Navigate to the job that created this model
    // Find the model's source job from registered models
    const currentModelName = document.getElementById('model-details-title').textContent;
    
    // Look for the job that created this model
    const sourceJob = jobHistory.find(job => {
        if (job.models && job.models.length > 0) {
            return job.models.some(model => model.name === currentModelName);
        }
        return false;
    });
    
    if (sourceJob) {
        showJobDetails(sourceJob);
    } else {
        alert('Source job not found for this model.');
    }
}

function showJobDetailsFromModel(jobIndex) {
    console.log('showJobDetailsFromModel called with jobIndex:', jobIndex);
    console.log('jobHistory length:', jobHistory.length);
    
    // Find the job in jobHistory by index
    const job = jobHistory[jobIndex];
    if (job) {
        console.log('Found job:', job.name);
        // Store the job index and navigate to job details
        sessionStorage.setItem('currentJobIndex', jobIndex);
        showJobDetails(job);
    } else {
        console.error('Job not found at index:', jobIndex);
        console.error('Available jobs:', jobHistory.map((j, i) => `${i}: ${j.name}`));
    }
}

function showConfigSettingsModal() {
    const flyout = document.getElementById('config-settings-flyout');
    const overlay = document.getElementById('flyout-overlay');
    const content = document.getElementById('config-settings-content');
    
    if (flyout && overlay && content && currentJobDetails) {
        // Get configuration from the job details directly (not from a nested config object)
        
        content.innerHTML = `
            <div class="config-section">
                <h4>Job Information</h4>
                <div class="config-item">
                    <label>Job Name:</label>
                    <span>${currentJobDetails.name || 'N/A'}</span>
                </div>
                <div class="config-item">
                    <label>Task Type:</label>
                    <span>${currentJobDetails.taskType || 'N/A'}</span>
                </div>
                <div class="config-item">
                    <label>Target Column:</label>
                    <span>${currentJobDetails.targetColumn || 'N/A'}</span>
                </div>
            </div>
            
            <div class="config-section">
                <h4>Training Configuration</h4>
                <div class="config-item">
                    <label>Primary Metric:</label>
                    <span>${currentJobDetails.primaryMetric || 'auc'}</span>
                </div>
                <div class="config-item">
                    <label>Algorithms:</label>
                    <span>${currentJobDetails.algorithms ? currentJobDetails.algorithms.join(', ') : 'logistic_regression, decision_tree, random_forest'}</span>
                </div>
            </div>
            
            <div class="config-section">
                <h4>Featurization Settings</h4>
                <div class="config-item">
                    <label>Normalize Features:</label>
                    <span>${currentJobDetails.normalizeFeatures ? 'Yes' : 'No'}</span>
                </div>
                <div class="config-item">
                    <label>Missing Data Strategy:</label>
                    <span>${currentJobDetails.missingDataStrategy === 'remove' ? 'Remove rows with missing values' : 'Fill missing values (mean for numeric, most frequent for categorical)'}</span>
                </div>
                ${currentJobDetails.categoricalSettings && Object.keys(currentJobDetails.categoricalSettings).length > 0 ? `
                <div class="config-item">
                    <label>Categorical Column Settings:</label>
                    <div class="categorical-settings">
                        ${Object.entries(currentJobDetails.categoricalSettings).map(([column, action]) => 
                            `<div class="categorical-item">${column}: ${action}</div>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        // Show overlay and flyout
        overlay.classList.add('show');
        flyout.classList.add('open');
    }
}

function closeAllFlyouts() {
    // Close all flyouts and the overlay
    const flyouts = ['config-settings-flyout', 'config-flyout', 'featurization-flyout'];
    const overlay = document.getElementById('flyout-overlay');
    
    flyouts.forEach(flyoutId => {
        const flyout = document.getElementById(flyoutId);
        if (flyout) {
            flyout.classList.remove('open');
        }
    });
    
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// Close flyout when clicking outside of it (handled by overlay click)
// No need for window click listener since we have the overlay

// Close flyout when pressing Escape
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const overlay = document.getElementById('flyout-overlay');
        if (overlay && overlay.classList.contains('show')) {
            closeAllFlyouts();
        }
    }
});

function viewConfigSettings() {
    if (!currentJobDetails) {
        console.error('No job details available to show configuration');
        return;
    }
    
    // Populate the configuration settings content
    const contentDiv = document.getElementById('config-settings-content');
    if (!contentDiv) {
        console.error('Configuration settings content div not found');
        return;
    }
    
    // Build the configuration display matching the Review step format
    const configHtml = `
        <div class="summary-section">
            <h4>Job Configuration</h4>
            <p><strong>Job Name:</strong> ${currentJobDetails.name || 'Unnamed Job'}</p>
            <p><strong>Task Type:</strong> ${currentJobDetails.taskType || 'Not specified'}</p>
            <p><strong>Target Column:</strong> ${currentJobDetails.targetColumn || 'Not specified'}</p>
            <p><strong>Compute Type:</strong> ${currentJobDetails.computeType || 'Not specified'}</p>
            <p><strong>Primary Metric:</strong> ${currentJobDetails.primaryMetric || 'Not specified'}</p>
            <p><strong>Algorithms:</strong> ${currentJobDetails.algorithms ? currentJobDetails.algorithms.join(', ') : 'Not specified'}</p>
            <p><strong>Normalize Features:</strong> ${currentJobDetails.normalizeFeatures ? 'Yes' : 'No'}</p>
            <p><strong>Missing Data:</strong> ${currentJobDetails.missingDataStrategy === 'remove' ? 'Remove rows' : (currentJobDetails.missingDataStrategy ? 'Fill missing values' : 'Not specified')}</p>
            ${currentJobDetails.categoricalSettings && Object.keys(currentJobDetails.categoricalSettings).length > 0 ? 
                `<p><strong>Categorical Columns:</strong> ${JSON.stringify(currentJobDetails.categoricalSettings)}</p>` : ''}
            ${currentJobDetails.metricThreshold ? 
                `<p><strong>Metric Score Threshold:</strong> ${currentJobDetails.metricThreshold}</p>` : ''}
            ${currentJobDetails.experimentTimeout ? 
                `<p><strong>Experiment Timeout:</strong> ${currentJobDetails.experimentTimeout} minutes</p>` : ''}
            <br>
            <p><strong>Created:</strong> ${currentJobDetails.startTime ? new Date(currentJobDetails.startTime).toLocaleString() : 'Unknown'}</p>
            <p><strong>Status:</strong> <span class="status-${currentJobDetails.status?.toLowerCase()}">${currentJobDetails.status || 'Unknown'}</span></p>
        </div>
    `;
    
    contentDiv.innerHTML = configHtml;
    
    // Show the flyout
    const flyout = document.getElementById('config-settings-flyout');
    const overlay = document.getElementById('flyout-overlay');
    
    if (flyout && overlay) {
        overlay.classList.add('show');
        flyout.classList.add('open');
    }
}

// Update metric threshold input constraints based on selected primary metric
function updateMetricThresholdConstraints(primaryMetric) {
    const metricThresholdInput = document.getElementById('metric-threshold');
    if (!metricThresholdInput) return;
    
    // Define valid ranges for different metrics
    const metricRanges = {
        // Classification metrics (0-1 range, higher is better)
        'auc': { min: 0, max: 1, placeholder: 'e.g., 0.85' },
        'accuracy': { min: 0, max: 1, placeholder: 'e.g., 0.90' },
        'precision': { min: 0, max: 1, placeholder: 'e.g., 0.85' },
        'recall': { min: 0, max: 1, placeholder: 'e.g., 0.80' },
        'f1': { min: 0, max: 1, placeholder: 'e.g., 0.85' },
        // Regression metrics (lower is better)
        'mae': { min: 0, max: null, placeholder: 'e.g., 5.0' },
        'rmse': { min: 0, max: null, placeholder: 'e.g., 10.0' },
        'r2': { min: null, max: 1, placeholder: 'e.g., 0.95' }
    };
    
    const range = metricRanges[primaryMetric];
    if (range) {
        metricThresholdInput.min = range.min !== null ? range.min : '';
        metricThresholdInput.max = range.max !== null ? range.max : '';
        metricThresholdInput.placeholder = range.placeholder;
        
        // Clear any existing value that might be out of range
        const currentValue = parseFloat(metricThresholdInput.value);
        if (metricThresholdInput.value && !isNaN(currentValue)) {
            if ((range.min !== null && currentValue < range.min) || 
                (range.max !== null && currentValue > range.max)) {
                metricThresholdInput.value = '';
            }
        }
    }
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.select();
        element.setSelectionRange(0, 99999); // For mobile devices
        navigator.clipboard.writeText(element.value).then(() => {
            // Could show a toast notification here
            console.log('Copied to clipboard:', element.value);
        });
    }
}

// Expandable section toggle function
function toggleLimitsSection() {
    const content = document.getElementById('limits-content');
    const header = event.target.closest('.expandable-header');
    
    if (content.classList.contains('show')) {
        content.classList.remove('show');
        header.classList.remove('expanded');
    } else {
        content.classList.add('show');
        header.classList.add('expanded');
    }
}

// Make functions available globally for PyScript and HTML
window.handleParsedData = handleParsedData;
window.handleTrainingComplete = handleTrainingComplete;
window.updateTrainingProgress = updateTrainingProgress;
window.completeTraining = completeTraining;
window.displayDataFileContent = displayDataFileContent;
window.notifyPyScriptReady = notifyPyScriptReady;
window.registerModel = registerModel;
window.closeRegisterModelModal = closeRegisterModelModal;
window.completeModelRegistration = completeModelRegistration;
window.navigateToSourceJob = navigateToSourceJob;
window.closeAllFlyouts = closeAllFlyouts;
window.viewConfigSettings = viewConfigSettings;
window.handleModelNameKeydown = handleModelNameKeydown;
window.deployChildModel = deployChildModel;
window.downloadChildModel = downloadChildModel;