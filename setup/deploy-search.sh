#!/bin/bash

# Script to deploy Azure AI Search and populate with HR policy data
# Exit on any error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_info() {
    echo -e "$1"
}

# Function to cleanup on error
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Script failed. Cleaning up partial deployments..."
        
        if [ ! -z "$SEARCH_SERVICE_NAME" ] && [ ! -z "$RESOURCE_GROUP" ]; then
            # Check if search service was created
            if az search service show --name "$SEARCH_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
                print_info "Deleting search service: $SEARCH_SERVICE_NAME"
                az search service delete --name "$SEARCH_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" --yes &>/dev/null || true
            fi
        fi
        
        if [ "$CREATED_RG" = true ] && [ ! -z "$RESOURCE_GROUP" ]; then
            # Only delete resource group if we created it and it's empty
            resource_count=$(az resource list --resource-group "$RESOURCE_GROUP" --query "length([])" -o tsv 2>/dev/null || echo "0")
            if [ "$resource_count" -eq 0 ]; then
                print_info "Deleting empty resource group: $RESOURCE_GROUP"
                az group delete --name "$RESOURCE_GROUP" --yes --no-wait &>/dev/null || true
            fi
        fi
    fi
}

trap cleanup EXIT

# Check if user is signed into Azure
print_info "Checking Azure login status..."
if ! az account show &>/dev/null; then
    print_error "You are not signed into Azure. Please run 'az login' and try again."
    exit 1
fi

print_success "Azure login verified"
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
print_info "Using subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"

# Get resource group name from user
read -p "Enter the resource group name: " RESOURCE_GROUP

if [ -z "$RESOURCE_GROUP" ]; then
    print_error "Resource group name cannot be empty"
    exit 1
fi

CREATED_RG=false

# Check if resource group exists, create if not
if az group show --name "$RESOURCE_GROUP" &>/dev/null; then
    print_info "Resource group '$RESOURCE_GROUP' already exists"
    LOCATION=$(az group show --name "$RESOURCE_GROUP" --query location -o tsv)
    print_info "Using location: $LOCATION"
else
    # Get location from user
    read -p "Enter the Azure region (e.g., eastus, westus, westeurope): " LOCATION
    
    if [ -z "$LOCATION" ]; then
        print_error "Location cannot be empty"
        exit 1
    fi
    
    print_info "Creating resource group '$RESOURCE_GROUP' in region '$LOCATION'..."
    if az group create --name "$RESOURCE_GROUP" --location "$LOCATION" &>/dev/null; then
        print_success "Resource group created successfully"
        CREATED_RG=true
    else
        print_error "Failed to create resource group"
        exit 1
    fi
fi

# Get unique search service name from user
SEARCH_SERVICE_NAME=""
while true; do
    read -p "Enter a unique name for the AI Search service: " SEARCH_SERVICE_NAME
    
    if [ -z "$SEARCH_SERVICE_NAME" ]; then
        print_error "Search service name cannot be empty"
        continue
    fi
    
    # Validate name format (lowercase letters, numbers, and hyphens only)
    if ! [[ "$SEARCH_SERVICE_NAME" =~ ^[a-z0-9-]+$ ]]; then
        print_error "Search service name can only contain lowercase letters, numbers, and hyphens"
        continue
    fi
    
    # Check if name is available
    print_info "Checking if name '$SEARCH_SERVICE_NAME' is available..."
    if az search service show --name "$SEARCH_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
        print_warning "Search service name '$SEARCH_SERVICE_NAME' already exists in this resource group. Please choose a different name."
        continue
    fi
    
    # Name appears available, will verify during creation
    break
done

# Try to create the search service with retry logic
SERVICE_CREATED=false
while [ "$SERVICE_CREATED" = false ]; do
    # Try to create Free SKU first
    print_info "Attempting to create AI Search service with Free SKU..."
    SKU="free"

    # Capture output and exit code
    set +e
    output=$(az search service create \
        --name "$SEARCH_SERVICE_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --sku "$SKU" \
        --location "$LOCATION" \
        --partition-count 1 \
        --replica-count 1 2>&1)
    exit_code=$?
    set -e
    
    if [ $exit_code -eq 0 ]; then
        print_success "AI Search service created with Free SKU"
        SERVICE_CREATED=true
    else
        # Check if it's a name conflict
        if echo "$output" | grep -qi "name is not available\|already exists\|already taken\|is already in use"; then
            print_warning "The name '$SEARCH_SERVICE_NAME' is already taken globally."
            read -p "Enter a different unique name for the AI Search service: " SEARCH_SERVICE_NAME
            
            if [ -z "$SEARCH_SERVICE_NAME" ]; then
                print_error "Search service name cannot be empty"
                continue
            fi
            
            if ! [[ "$SEARCH_SERVICE_NAME" =~ ^[a-z0-9-]+$ ]]; then
                print_error "Search service name can only contain lowercase letters, numbers, and hyphens"
                continue
            fi
            continue
        fi
        
        # Free SKU failed for other reasons, try Basic
        print_warning "Failed to create Free SKU (likely quota exceeded). Attempting Basic SKU..."
        SKU="basic"
        
        set +e
        output=$(az search service create \
            --name "$SEARCH_SERVICE_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --sku "$SKU" \
            --location "$LOCATION" \
            --partition-count 1 \
            --replica-count 1 2>&1)
        exit_code=$?
        set -e
        
        if [ $exit_code -eq 0 ]; then
            print_success "AI Search service created with Basic SKU"
            SERVICE_CREATED=true
        else
            # Check if Basic also failed due to name conflict
            if echo "$output" | grep -qi "name is not available\|already exists\|already taken\|is already in use"; then
                print_warning "The name '$SEARCH_SERVICE_NAME' is already taken globally."
                read -p "Enter a different unique name for the AI Search service: " SEARCH_SERVICE_NAME
                
                if [ -z "$SEARCH_SERVICE_NAME" ]; then
                    print_error "Search service name cannot be empty"
                    continue
                fi
                
                if ! [[ "$SEARCH_SERVICE_NAME" =~ ^[a-z0-9-]+$ ]]; then
                    print_error "Search service name can only contain lowercase letters, numbers, and hyphens"
                    continue
                fi
                continue
            else
                print_error "Failed to create AI Search service. This may be due to policy constraints or quota limitations."
                echo "$output"
                exit 1
            fi
        fi
    fi
done

# Wait for service to be ready
print_info "Waiting for search service to be ready..."
sleep 10

# Get the admin key
print_info "Retrieving admin key..."
ADMIN_KEY=$(az search admin-key show --service-name "$SEARCH_SERVICE_NAME" --resource-group "$RESOURCE_GROUP" --query primaryKey -o tsv)

if [ -z "$ADMIN_KEY" ]; then
    print_error "Failed to retrieve admin key"
    exit 1
fi

# Get search service endpoint
SEARCH_ENDPOINT="https://${SEARCH_SERVICE_NAME}.search.windows.net"

# Create the index
print_info "Creating index 'hr-index'..."

# Check if index schema file exists
if [ ! -f "index-schema.json" ]; then
    print_error "index-schema.json file not found in current directory"
    exit 1
fi

# Create index using REST API
create_index_response=$(curl -s -w "\n%{http_code}" -X POST \
    "${SEARCH_ENDPOINT}/indexes?api-version=2023-11-01" \
    -H "Content-Type: application/json" \
    -H "api-key: ${ADMIN_KEY}" \
    -d @index-schema.json)

http_code=$(echo "$create_index_response" | tail -n 1)
response_body=$(echo "$create_index_response" | head -n -1)

if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 204 ]; then
    print_success "Index 'hr-index' created successfully"
else
    print_error "Failed to create index. HTTP Status: $http_code"
    print_error "Response: $response_body"
    exit 1
fi

# Upload documents to the index
print_info "Uploading HR policy documents to the index..."

# Check if data file exists
if [ ! -f "hr-data.json" ]; then
    print_error "hr-data.json file not found in current directory"
    exit 1
fi

# Upload documents using REST API
upload_response=$(curl -s -w "\n%{http_code}" -X POST \
    "${SEARCH_ENDPOINT}/indexes/hr-index/docs/index?api-version=2023-11-01" \
    -H "Content-Type: application/json" \
    -H "api-key: ${ADMIN_KEY}" \
    -d @hr-data.json)

http_code=$(echo "$upload_response" | tail -n 1)
response_body=$(echo "$upload_response" | head -n -1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    print_success "Documents uploaded successfully"
else
    print_error "Failed to upload documents. HTTP Status: $http_code"
    print_error "Response: $response_body"
    exit 1
fi

# Disable cleanup on success
trap - EXIT

print_success "Deployment completed successfully!"
print_info "Search Service: $SEARCH_SERVICE_NAME"
print_info "Resource Group: $RESOURCE_GROUP"
print_info "SKU: $SKU"
print_info "Endpoint: $SEARCH_ENDPOINT"
print_info "Index: hr-index"
