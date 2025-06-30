// Projects Page JavaScript
class ProjectsPage {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.projectCards = document.querySelectorAll('.project-card');
    this.sliderContainer = document.querySelector('.slider-container');
    this.prevButton = document.querySelector('.slider-button.prev');
    this.nextButton = document.querySelector('.slider-button.next');
    this.filterToggle = document.querySelector('.filter-toggle');
    this.filterPanel = document.querySelector('.filter-panel');
    this.filterOptions = document.querySelectorAll('.filter-option input');
    
    // Search functionality
    this.searchInput = document.getElementById('projects-search');
    this.searchResultsCount = document.querySelector('.search-results-count');
    this.searchTerm = '';
    
    this.currentPage = 0;
    this.slidesPerPage = this.getSlidesPerPage();
    this.autoSlideInterval = null;
    this.observer = null;
    
    // Spotlight pagination
    this.slidesPerPage = 3; // Show 3 slides at a time
    this.currentPage = 0;
    this.spotlightPrevButton = document.querySelector('.spotlight-section .pagination-button.prev-page');
    this.spotlightNextButton = document.querySelector('.spotlight-section .pagination-button.next-page');
    this.spotlightCurrentPageSpan = document.querySelector('.spotlight-section .current-page');
    this.spotlightTotalPagesSpan = document.querySelector('.spotlight-section .total-pages');
    
    // Community projects pagination
    this.projectsPerPage = 25; // Show 25 projects per page
    this.currentProjectsPage = window.location.pathname.includes('projects-page-2.html') ? 2 : 1;
    this.communityPrevButton = document.querySelector('.community-section .pagination-button.prev-page');
    this.communityNextButton = document.querySelector('.community-section .pagination-button.next-page');
    this.communityCurrentPageSpan = document.querySelector('.community-section .current-page');
    this.communityTotalPagesSpan = document.querySelector('.community-section .total-pages');
    
    this.allProjects = [];
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.slides.forEach(slide => {
      slide.style.display = 'block';
      slide.classList.remove('active');
      slide.style.animation = '';
    });
    this.checkSuccessMessage();
    this.setupPagination();
    this.updateSpotlightPagination();
    this.updateCommunityPagination();
    this.updateProjectsPage();

    // Add event listener for always-visible clear filters button
    const clearBtn = document.querySelector('.cta-buttons .clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearFilters());
    }
  }

  getSlidesPerPage() {
    return window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
  }

  setupEventListeners() {
    // Search functionality
    this.searchInput?.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.updateSearchResults();
    });

    // Ctrl+F functionality
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        this.searchInput?.focus();
        this.searchInput?.select();
      }
    });

    // Search button
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        this.searchInput?.focus();
      });
    }

    // Slider navigation
    this.prevButton?.addEventListener('click', () => {
      this.prevPage();
      this.stopAutoSlide();
    });

    this.nextButton?.addEventListener('click', () => {
      this.nextPage();
      this.stopAutoSlide();
    });

    // Filter toggle
    this.filterToggle?.addEventListener('click', () => {
      const isHidden = this.filterPanel.style.display === 'none' || this.filterPanel.style.display === '';
      this.filterPanel.style.display = isHidden ? 'block' : 'none';
      this.filterToggle.classList.toggle('active');
    });

    // Filter options
    this.filterOptions?.forEach(option => {
      option.addEventListener('change', () => this.updateVisibility());
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.updateSlidesPerPage();
    });

    // Event delegation for project cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.slide, .project-card');
      if (card) {
        this.handleCardClick(card);
      }
    });
  }

  setupIntersectionObserver() {
    const options = {
      threshold: 0.5,
      rootMargin: '50px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.dataset.target);
          this.animateCounter(counter, target);
          this.observer.unobserve(counter);
        }
      });
    }, options);

    document.querySelectorAll('.metric-value').forEach(counter => {
      this.observer.observe(counter);
    });
  }

  showPage(page) {
    const totalPages = Math.ceil(this.slides.length / this.slidesPerPage);
    this.currentPage = (page + totalPages) % totalPages;

    this.slides.forEach((slide, index) => {
      const slidePosition = index - (this.currentPage * this.slidesPerPage);
      
      if (slidePosition >= 0 && slidePosition < this.slidesPerPage) {
        slide.style.display = 'block';
        slide.classList.add('active');
        slide.style.animation = 'slideIn 0.5s forwards';
        slide.style.animationDelay = `${slidePosition * 0.1}s`;
      } else {
        slide.style.display = 'none';
        slide.classList.remove('active');
        slide.style.animation = '';
      }
    });
  }

  nextPage() {
    this.showPage(this.currentPage + 1);
  }

  prevPage() {
    this.showPage(this.currentPage - 1);
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(() => this.nextPage(), 5000);
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  updateSlidesPerPage() {
    this.slidesPerPage = this.getSlidesPerPage();
    this.showPage(this.currentPage);
  }

  animateCounter(counter, target) {
    let current = 0;
    const duration = 2000;
    const step = (target / duration) * 16;
    
    counter.classList.add('animate-count');
    
    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.round(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };
    
    updateCounter();
  }

  updateVisibility() {
    const selectedFilters = this.getSelectedFilters();
    this.updateFilterCount(selectedFilters);
    this.filterProjects(selectedFilters);
  }

  getSelectedFilters() {
    const filters = {
      category: new Set(),
      type: new Set()
    };

    this.filterOptions.forEach(option => {
      if (option.checked) {
        filters[option.name].add(option.value);
      }
    });

    return filters;
  }

  updateFilterCount(selectedFilters) {
    const totalSelected = Object.values(selectedFilters)
      .reduce((sum, set) => sum + set.size, 0);
    const filterCount = document.querySelector('.filter-count');
    
    if (totalSelected > 0) {
      filterCount.textContent = `(${totalSelected})`;
      this.filterToggle.classList.add('has-filters');
    } else {
      filterCount.textContent = '';
      this.filterToggle.classList.remove('has-filters');
    }
  }

  async filterProjects(selectedFilters) {
    const hasCategoryFilters = selectedFilters.category && selectedFilters.category.size > 0;
    const hasTypeFilters = selectedFilters.type && selectedFilters.type.size > 0;

    if (!hasCategoryFilters && !hasTypeFilters) {
      renderProjects(this.allProjects);
      return;
    }

    let filtered = this.allProjects;
    if (hasCategoryFilters) {
      filtered = filtered.filter(project =>
        Array.from(selectedFilters.category).includes(project.category)
      );
    }
    if (hasTypeFilters) {
      filtered = filtered.filter(project =>
        Array.from(selectedFilters.type).includes(project.type)
      );
    }
    if (filtered.length === 1) {
      window.showPopup(filtered[0]);
    } else if (filtered.length > 1) {
      this.showMultipleProjectsPopupFromData(filtered);
    } else {
      renderProjects(filtered);
    }
  }

  showMultipleProjectsPopup(cards) {
    console.log('Popup called with projects:', cards);
    // Remove any existing filter popups
    document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
    // Create popup overlay
    const div = document.createElement('div');
    div.className = 'popup-overlay filter-popup';
    div.innerHTML = `
      <div class="project-popup" style="max-width:900px;overflow:auto;max-height:90vh;">
        <button class="close-button" style="font-size:2.5rem;line-height:2rem;width:2.5rem;height:2.5rem;top:1rem;right:1rem;position:absolute;z-index:10;background:none;border:none;cursor:pointer;">×</button>
        <div style="padding:1rem 1rem 0 1rem;text-align:center;">
          <h2>Matching Projects</h2>
        </div>
        <div class="popup-projects-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;padding:1.5rem;"></div>
      </div>
    `;
    document.body.prepend(div);
    // Render each matching card as a mini card in the popup
    const grid = div.querySelector('.popup-projects-grid');
    cards.forEach(card => {
      const miniCard = card.cloneNode(true);
      miniCard.classList.add('popup-mini-card');
      // Remove any event listeners from the clone
      miniCard.onclick = null;
      grid.appendChild(miniCard);
    });
    // Robust close button
    const closeBtn = div.querySelector('.close-button');
    if (closeBtn) {
      closeBtn.onclick = () => div.remove();
    } else {
      // Fallback: close on overlay click
      div.onclick = (e) => {
        if (e.target === div) div.remove();
      };
    }
  }

  showNoResultsPopup() {
    // Remove any existing filter popups
    document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
    // Create a simple popup
    const div = document.createElement('div');
    div.className = 'popup-overlay filter-popup';
    div.innerHTML = `
      <div class="project-popup">
        <button class="close-button">×</button>
        <div style="padding:2rem;text-align:center;">
          <h2>No projects found in the selected category.</h2>
          <button class="secondary-button clear-filters">
            Clear Filters <span class="button-icon">×</span>
          </button>
        </div>
      </div>
    `;
    document.body.prepend(div);
    div.querySelector('.close-button').onclick = () => div.remove();
    div.querySelector('.clear-filters').onclick = () => this.clearFilters();
  }

  showAllProjects() {
    this.projectCards.forEach(card => card.style.display = 'block');
    // Remove any filter popups
    document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
  }

  handleCardClick(card) {
    if (this.autoSlideInterval) {
      this.stopAutoSlide();
    }
    
    // Remove any existing popups first
    document.querySelectorAll('.popup-overlay').forEach(el => el.remove());
    
    const template = document.querySelector('#project-popup-template');
    const popup = template.content.cloneNode(true);
    
    this.populatePopupContent(popup, card);
    document.body.appendChild(popup);
    
    this.setupPopupClose(popup, card);
  }

  populatePopupContent(popup, card) {
    const title = card.querySelector('h3').textContent;
    const tags = Array.from(card.querySelectorAll('.project-tags .tag')).map(tag => tag.cloneNode(true));
    
    const leadName = card.dataset.leadName || 'Project Lead Name';
    const leadRole = card.dataset.leadRole || 'Project Role';
    const leadEmail = card.dataset.leadEmail || '';
    const leadPhone = card.dataset.leadPhone || '';
    
    popup.querySelector('h2').textContent = title;
    popup.querySelector('.member-name').textContent = leadName;
    popup.querySelector('.member-role').textContent = leadRole;
    
    const popupTags = popup.querySelector('.project-tags');
    popupTags.innerHTML = '';
    tags.forEach(tag => popupTags.appendChild(tag));
    
    this.setupContactInfo(popup, leadEmail, leadPhone);

    const activityList = popup.querySelector('.activity-list');
    const emptyState = activityList.querySelector('.empty-state');
    let activityLog = [];
    if (card.dataset.activityLog) {
      try {
        activityLog = JSON.parse(card.dataset.activityLog);
      } catch (e) {}
    }
    if (activityLog && activityLog.length > 0) {
      const activityItemsContainer = document.createElement('div');
      activityItemsContainer.className = 'activity-items';
      activityLog.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = activity;
        activityItemsContainer.appendChild(activityItem);
      });
      activityList.insertBefore(activityItemsContainer, emptyState);
      emptyState.remove();
    }
  }

  setupContactInfo(popup, email, phone) {
    const contactDetails = popup.querySelector('.contact-details');
    const emailElement = contactDetails.querySelector('.contact-method:first-child .contact-value');
    const phoneElement = contactDetails.querySelector('.contact-method:last-child .contact-value');
    
    emailElement.textContent = email;
    phoneElement.textContent = phone;
    
    if (!email && !phone) {
      phoneElement.parentElement.style.display = 'none';
      emailElement.parentElement.style.display = 'none';
    } else {
      if (!email) emailElement.parentElement.style.display = 'none';
      if (!phone) phoneElement.parentElement.style.display = 'none';
    }
  }

  setupPopupClose(popup, card) {
    const overlay = document.querySelector('.popup-overlay');
    const closeButton = overlay.querySelector('.close-button');
    
    if (overlay) {
      const closePopup = () => {
        overlay.remove();
        if (card.classList.contains('slide')) {
          this.startAutoSlide();
        }
      };
      
      // Add click handler for overlay background
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          closePopup();
        }
      };
      
      // Add click handler for close button
      if (closeButton) {
        closeButton.onclick = (e) => {
          e.stopPropagation(); // Prevent event from bubbling to overlay
          closePopup();
        };
      }
    }
  }

  checkSuccessMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
      const successMessage = document.getElementById('submission-success');
      successMessage.style.display = 'block';
      
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 10000);
    }
  }

  setupPagination() {
    // Setup spotlight pagination
    if (this.spotlightPrevButton && this.spotlightNextButton) {
      this.spotlightPrevButton.addEventListener('click', () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.showPage(this.currentPage);
          this.updateSpotlightPagination();
        }
      });

      this.spotlightNextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(this.slides.length / this.slidesPerPage);
        if (this.currentPage < totalPages - 1) {
          this.currentPage++;
          this.showPage(this.currentPage);
          this.updateSpotlightPagination();
        }
      });
    }

    // Setup community projects pagination
    if (this.communityPrevButton && this.communityNextButton) {
      this.communityPrevButton.addEventListener('click', () => {
        if (this.currentProjectsPage === 2) {
          window.location.href = 'projects.html';
        }
      });

      this.communityNextButton.addEventListener('click', () => {
        if (this.currentProjectsPage === 1) {
          window.location.href = 'projects-page-2.html';
        }
      });
    }
  }

  updateProjectsPage() {
    const startIndex = (this.currentProjectsPage - 1) * this.projectsPerPage;
    const endIndex = startIndex + this.projectsPerPage;

    this.projectCards.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  updateSpotlightPagination() {
    if (!this.spotlightCurrentPageSpan || !this.spotlightTotalPagesSpan) return;

    const totalPages = Math.ceil(this.slides.length / this.slidesPerPage);
    
    this.spotlightCurrentPageSpan.textContent = this.currentPage + 1;
    this.spotlightTotalPagesSpan.textContent = totalPages;
    
    if (this.spotlightPrevButton) {
      this.spotlightPrevButton.disabled = this.currentPage === 0;
      this.spotlightPrevButton.innerHTML = '<span class="button-icon">←</span> Previous';
    }
    
    if (this.spotlightNextButton) {
      this.spotlightNextButton.disabled = this.currentPage === totalPages - 1;
      this.spotlightNextButton.innerHTML = 'Next <span class="button-icon">→</span>';
    }
  }

  updateCommunityPagination() {
    if (!this.communityCurrentPageSpan || !this.communityTotalPagesSpan) return;
    
    this.communityCurrentPageSpan.textContent = this.currentProjectsPage;
    this.communityTotalPagesSpan.textContent = 2; // We have 2 pages total
    
    if (this.communityPrevButton) {
      this.communityPrevButton.disabled = this.currentProjectsPage === 1;
      if (this.currentProjectsPage === 2) {
        this.communityPrevButton.innerHTML = '<span class="button-icon">←</span> Back to Project Hub';
      } else {
        this.communityPrevButton.innerHTML = '<span class="button-icon">←</span> Previous';
      }
    }
    
    if (this.communityNextButton) {
      this.communityNextButton.disabled = this.currentProjectsPage === 2;
      if (this.currentProjectsPage === 1) {
        this.communityNextButton.innerHTML = 'View More Projects <span class="button-icon">→</span>';
      } else {
        this.communityNextButton.innerHTML = 'Next <span class="button-icon">→</span>';
      }
    }
  }

  clearFilters() {
    // Uncheck all filter checkboxes
    this.filterOptions.forEach(option => {
      option.checked = false;
    });

    // Reset filter count
    const filterCount = document.querySelector('.filter-count');
    if (filterCount) {
      filterCount.textContent = '';
    }

    // Remove has-filters class from filter toggle
    this.filterToggle.classList.remove('has-filters');

    // Hide filter panel
    if (this.filterPanel) {
      this.filterPanel.style.display = 'none';
    }

    // Show all projects
    this.showAllProjects();

    // Remove any filter popups
    document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
  }

  updateSearchResults() {
    if (!this.searchInput || !this.searchResultsCount) return;

    const searchTerm = this.searchTerm.toLowerCase();
    const projectCards = document.querySelectorAll('.project-card, .event-tile');
    let visibleCount = 0;
    let totalCount = projectCards.length;

    projectCards.forEach(card => {
      const title = card.querySelector('.project-title, .event-tile-title')?.textContent?.toLowerCase() || '';
      const description = card.querySelector('.project-description, .event-tile-desc')?.textContent?.toLowerCase() || '';
      const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());
      const category = card.querySelector('.tag-category')?.textContent?.toLowerCase() || '';
      const type = card.querySelector('.tag-type')?.textContent?.toLowerCase() || '';

      const matchesSearch = !searchTerm || 
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        tags.some(tag => tag.includes(searchTerm)) ||
        category.includes(searchTerm) ||
        type.includes(searchTerm);

      if (matchesSearch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update search results count
    if (searchTerm) {
      this.searchResultsCount.textContent = `Showing ${visibleCount} of ${totalCount} projects`;
    } else {
      this.searchResultsCount.textContent = `Showing all ${totalCount} projects`;
    }
  }

  showMultipleProjectsPopupFromData(projects) {
    // Remove any existing filter popups
    document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
    // Create popup overlay
    const div = document.createElement('div');
    div.className = 'popup-overlay filter-popup';
    div.innerHTML = `
      <div class="project-popup" style="max-width:900px;overflow:auto;max-height:90vh;">
        <button class="close-button" style="font-size:2.5rem;line-height:2rem;width:2.5rem;height:2.5rem;top:1rem;right:1rem;position:absolute;z-index:10;background:none;border:none;cursor:pointer;">×</button>
        <div style="padding:1rem 1rem 0 1rem;text-align:center;">
          <h2>Matching Projects</h2>
        </div>
        <div class="popup-projects-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;padding:1.5rem;"></div>
      </div>
    `;
    document.body.prepend(div);
    // Render each matching project as a mini card in the popup
    const grid = div.querySelector('.popup-projects-grid');
    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card popup-mini-card';
      card.innerHTML = `
        <div class="project-header">
          <h3 class="project-title">${project.title}</h3>
          <div class="project-tags">
            <span class="tag tag-type">${project.type || ''}</span>
            <span class="tag tag-category">${project.category || ''}</span>
            <span class="tag tag-stage">${project.stage || ''}</span>
            <span class="tag tag-team">${project.team || ''}</span>
          </div>
        </div>
        <p class="project-description">${project.description || ''}</p>
      `;
      card.onclick = () => window.showPopup(project);
      grid.appendChild(card);
    });
    // Robust close button
    const closeBtn = div.querySelector('.close-button');
    if (closeBtn) {
      closeBtn.onclick = () => div.remove();
    } else {
      // Fallback: close on overlay click
      div.onclick = (e) => {
        if (e.target === div) div.remove();
      };
    }
  }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const projectsPage = new ProjectsPage();
  const grid = document.querySelector('.projects-grid');
  const template = document.getElementById('project-card-template');
  let allProjects = [];
  let filteredProjects = [];

  // Fetch project data
  fetch('projects.json')
    .then(res => res.json())
    .then(data => {
      allProjects = data;
      filteredProjects = data;
      projectsPage.allProjects = data;
      renderProjects(filteredProjects);
    });

  // Helper to format event date
  function formatEventDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('default', { month: 'short', day: 'numeric' });
  }

  // Render projects
  async function renderProjects(projects) {
    grid.innerHTML = '';
    
    // Separate events, products and regular projects
    const events = projects.filter(p => p.isEvent);
    const products = projects.filter(p => p.isProduct);
    const regularProjects = projects.filter(p => !p.isEvent && !p.isProduct);
    
    // Interleave events, products and projects
    const maxLen = Math.max(events.length, products.length, regularProjects.length);
    const eventTemplate = document.getElementById('event-tile-template');
    for (let i = 0; i < maxLen; i++) {
      if (i < regularProjects.length) {
        const project = regularProjects[i];
        const card = template.content.cloneNode(true).querySelector('.project-card');
        // Add CTRL Picks badge if applicable
        if (project.ctrlPick) {
          const badge = document.createElement('div');
          badge.className = 'ctrl-pick-badge';
          badge.innerHTML = '<span class="star-icon">⭐</span> CTRL Picks';
          card.prepend(badge);
        }
        card.querySelector('.project-title').textContent = project.title;
        const tags = card.querySelector('.project-tags');
        tags.innerHTML = '';
        if (project.category) {
          tags.innerHTML += `<span class="tag tag-category">${project.category}</span>`;
        }
        const otherTags = [
          { value: project.type, class: 'tag-type' },
          { value: project.stage, class: 'tag-stage' },
          { value: project.modality, class: 'tag-modality' },
          { value: project.team, class: 'tag-team' },
          { value: project.marketReach, class: 'tag-market' },
          { value: project.duration, class: 'tag-duration' }
        ].filter(tag => tag.value);
        if (project.status && Array.isArray(project.status)) {
          project.status.forEach(st => {
            if (st) otherTags.push({ value: st, class: 'tag-status' });
          });
        }
        otherTags.forEach((tag, index) => {
          const colorClass = `tag-color-${(index % 8) + 1}`;
          tags.innerHTML += `<span class="tag ${tag.class} ${colorClass}">${tag.value}</span>`;
        });
        card.querySelector('.project-description').textContent = project.description || '';
        card.dataset.leadName = project.leadName || '';
        card.dataset.leadRole = project.leadRole || '';
        card.dataset.leadEmail = project.leadEmail || '';
        card.dataset.leadPhone = project.leadPhone || '';
        card.dataset.preferredContact = project.preferredContact || '';
        card.dataset.title = project.title || '';
        card.dataset.type = project.type || '';
        card.dataset.category = project.category || '';
        card.dataset.stage = project.stage || '';
        card.dataset.team = project.team || '';
        card.dataset.modality = project.modality || '';
        card.dataset.marketReach = project.marketReach || '';
        card.dataset.duration = project.duration || '';
        card.dataset.status = project.status ? project.status.join(',') : '';
        card.dataset.description = project.description || '';
        card.dataset.ctrlPick = project.ctrlPick ? 'true' : '';
        card.dataset.website = project.website || '';
        card.dataset.activityLog = project.activityLog ? JSON.stringify(project.activityLog) : '';
        card.addEventListener('click', () => projectsPage.handleCardClick(card));
        grid.appendChild(card);
      }
      if (i < products.length) {
        const product = products[i];
        const card = document.createElement('div');
        card.className = 'project-card product-card';
        card.innerHTML = `
          <div class="project-header">
            <div class="business-name">${product.businessName}</div>
            <h3 class="project-title">${product.title}</h3>
            <div class="project-tags">
              <span class="tag tag-type">${product.type}</span>
              <span class="tag tag-category">${product.category}</span>
              <span class="tag tag-price">${product.productPrice}</span>
            </div>
          </div>
          <p class="project-description">${product.description}</p>
          <a href="${product.website}" class="view-product-button" target="_blank">
            View Product
            <span class="button-icon">→</span>
          </a>
        `;
        grid.appendChild(card);
      }
      if (i < events.length) {
        const event = events[i];
        const tile = eventTemplate.content.cloneNode(true).querySelector('.event-tile');
        tile.querySelector('.event-tile-date').textContent = formatEventDate(event.date);
        tile.querySelector('.event-tile-title').textContent = event.title;
        tile.querySelector('.event-tile-desc').textContent = event.description;
        if (event.category) {
          tile.querySelector('.event-tile-category').textContent = event.category;
        } else {
          tile.querySelector('.event-tile-category').style.display = 'none';
        }
        tile.style.background = event.color || '#f6f8fc';
        tile.style.color = event.textColor || '#333';
        tile.style.cursor = 'pointer';
        if (event.link) {
          tile.onclick = () => window.open(event.link, '_blank');
        }
        grid.appendChild(tile);
      }
    }
    // If no projects, products or events at all
    if (events.length === 0 && products.length === 0 && regularProjects.length === 0) {
      const msg = document.createElement('div');
      msg.textContent = 'No projects, products or events found.';
      msg.style.color = '#888';
      msg.style.margin = '2rem 0';
      grid.appendChild(msg);
    }
  }

  // Popup logic
  function showPopup(project) {
    // Remove any existing popups first
    document.querySelectorAll('.popup-overlay').forEach(el => el.remove());
    
    const template = document.getElementById('project-popup-template');
    const popup = template.content.cloneNode(true);
    popup.querySelector('h2').textContent = project.title;
    const tags = popup.querySelector('.project-tags');
    tags.innerHTML = '';
    if (project.type) tags.innerHTML += `<span class="tag tag-type">${project.type}</span>`;
    if (project.stage) tags.innerHTML += `<span class="tag tag-stage">${project.stage}</span>`;
    if (project.category) tags.innerHTML += `<span class="tag tag-category">${project.category}</span>`;
    if (project.modality) tags.innerHTML += `<span class="tag tag-modality">${project.modality}</span>`;
    if (project.team) tags.innerHTML += `<span class="tag tag-team">${project.team}</span>`;
    if (project.marketReach) tags.innerHTML += `<span class="tag tag-market">${project.marketReach}</span>`;
    if (project.duration) tags.innerHTML += `<span class="tag tag-duration">${project.duration}</span>`;
    if (project.status && Array.isArray(project.status)) {
      project.status.forEach(st => {
        tags.innerHTML += `<span class="tag tag-status">${st}</span>`;
      });
    }
    // Add website button if present, right after tags
    if (project.website) {
      const btn = document.createElement('a');
      btn.href = project.website;
      btn.target = '_blank';
      btn.className = 'primary-button';
      btn.style.margin = '1rem 0 0 0';
      btn.innerHTML = 'Visit Project Website →';
      tags.parentNode.insertBefore(btn, tags.nextSibling);
    }
    popup.querySelector('.member-name').textContent = project.leadName;
    popup.querySelector('.member-role').textContent = project.leadRole;
    const contactDetails = popup.querySelector('.contact-details');
    contactDetails.querySelector('.contact-method:first-child .contact-value').textContent = project.leadEmail;
    contactDetails.querySelector('.contact-method:last-child .contact-value').textContent = project.leadPhone;
    if (!project.leadEmail) contactDetails.querySelector('.contact-method:first-child').style.display = 'none';
    if (!project.leadPhone) contactDetails.querySelector('.contact-method:last-child').style.display = 'none';

    // Update activity log section
    const activityList = popup.querySelector('.activity-list');
    const emptyState = activityList.querySelector('.empty-state');
    
    if (project.activityLog && project.activityLog.length > 0) {
      // Create a container for activity items
      const activityItemsContainer = document.createElement('div');
      activityItemsContainer.className = 'activity-items';
      // Add activity items
      project.activityLog.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = activity;
        activityItemsContainer.appendChild(activityItem);
      });
      // Insert activity items before the empty state
      activityList.insertBefore(activityItemsContainer, emptyState);
      // Remove the empty state entirely if there are activity items
      emptyState.remove();
    }

    document.body.appendChild(popup);
    
    const overlay = document.querySelector('.popup-overlay');
    const closeButton = overlay.querySelector('.close-button');
    
    const closePopup = () => {
      overlay.remove();
    };
    
    // Add click handler for overlay background
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        closePopup();
      }
    };
    
    // Add click handler for close button
    if (closeButton) {
      closeButton.onclick = (e) => {
        e.stopPropagation(); // Prevent event from bubbling to overlay
        closePopup();
      };
    }
  }

  window.showPopup = showPopup;
  window.projectsPage = projectsPage;
}); 