// Resources Page JavaScript
class ResourcesPage {
  constructor() {
    this.resourcesData = null;
    this.allResources = [];
    this.filteredResources = [];
    this.currentFilter = 'all';
    this.searchTerm = '';
    
    this.searchInput = document.getElementById('resources-search');
    this.resourcesGrid = document.getElementById('resources-grid');
    this.filterTags = document.querySelectorAll('.filter-tag');
    this.searchResultsCount = document.querySelector('.search-results-count');
    this.noResultsElement = document.getElementById('no-results');
    
    this.init();
  }

  async init() {
    await this.loadResources();
    this.setupEventListeners();
    this.renderResources();
  }

  async loadResources() {
    try {
      const response = await fetch('resources.json');
      this.resourcesData = await response.json();
      // Now resourcesData is a flat array
      this.allResources = Array.isArray(this.resourcesData) ? this.resourcesData : [];
      this.filteredResources = [...this.allResources];
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  }

  setupEventListeners() {
    // Search functionality
    this.searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.filterAndRender();
    });

    // Filter tags
    this.filterTags.forEach(tag => {
      tag.addEventListener('click', () => {
        this.filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        this.currentFilter = tag.dataset.filter;
        this.filterAndRender();
      });
    });

    // Ctrl+F functionality
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        this.searchInput.focus();
        this.searchInput.select();
      }
    });

    // Search button
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        this.searchInput.focus();
      });
    }
  }

  filterAndRender() {
    this.filteredResources = this.allResources.filter(resource => {
      // Apply tag filter
      const matchesFilter = this.currentFilter === 'all' || 
        (resource.tags && resource.tags.includes(this.currentFilter));
      // Apply search filter
      const matchesSearch = !this.searchTerm || 
        resource.title.toLowerCase().includes(this.searchTerm) ||
        resource.description.toLowerCase().includes(this.searchTerm) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(this.searchTerm)));
      return matchesFilter && matchesSearch;
    });
    this.renderResources();
  }

  renderResources() {
    if (this.filteredResources.length === 0) {
      this.resourcesGrid.style.display = 'none';
      this.noResultsElement.style.display = 'block';
      this.searchResultsCount.textContent = 'No resources found';
    } else {
      this.resourcesGrid.style.display = 'grid';
      this.noResultsElement.style.display = 'none';
      const totalCount = this.allResources.length;
      const filteredCount = this.filteredResources.length;
      if (this.searchTerm || this.currentFilter !== 'all') {
        this.searchResultsCount.textContent = `Showing ${filteredCount} of ${totalCount} resources`;
      } else {
        this.searchResultsCount.textContent = `Showing all ${totalCount} resources`;
      }
      this.resourcesGrid.innerHTML = this.filteredResources.map(resource => 
        this.createResourceCard(resource)
      ).join('');
    }
  }

  createResourceCard(resource) {
    const priceDisplay = resource.price > 0 ? `$${resource.price}` : 'Free';
    const priceClass = resource.price > 0 ? 'price-paid' : 'price-free';
    return `
      <div class="resource-card" data-tags="${resource.tags ? resource.tags.join(',') : ''}">
        <div class="resource-header">
          <div class="resource-icon">${resource.icon}</div>
          <div class="resource-meta">
            <div class="resource-category">&nbsp;</div>
            <div class="resource-price ${priceClass}">${priceDisplay}</div>
          </div>
        </div>
        <div class="resource-content">
          <h3 class="resource-title">${resource.title}</h3>
          <p class="resource-description">${resource.description}</p>
          <div class="resource-tags">
            ${resource.tags ? resource.tags.map(tag => 
              `<span class="resource-tag">${this.formatTag(tag)}</span>`
            ).join('') : ''}
          </div>
        </div>
        <div class="resource-footer">
          <a href="${resource.viewResourceLink || resource.link}" 
             class="resource-link" 
             target="_blank"
             rel="noopener noreferrer">
            View Resource
            <span class="link-icon">→</span>
          </a>
        </div>
      </div>
    `;
  }

  formatTag(tag) {
    // Capitalize each word, keep CTRL philosophy as is
    if (tag === 'CTRL philosophy') return 'CTRL Philosophy';
    return tag.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

// Global function for clearing all filters
function clearAllFilters() {
  const resourcesPage = window.resourcesPage;
  if (resourcesPage) {
    resourcesPage.searchInput.value = '';
    resourcesPage.searchTerm = '';
    resourcesPage.currentFilter = 'all';
    // Reset filter tags
    resourcesPage.filterTags.forEach(tag => {
      tag.classList.toggle('active', tag.dataset.filter === 'all');
    });
    resourcesPage.filterAndRender();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.resourcesPage = new ResourcesPage();
}); 