// Cultural Events Website - Main JavaScript

class CulturalEventsApp {
    constructor() {
        this.events = [];
        this.places = [];
        this.filteredEvents = [];
        this.selectedEvents = new Set();
        this.templates = {}; // Store loaded templates
        this.currentFilters = {
            startDate: null,
            endDate: null,
            places: [],
            types: [],
            minPrice: null,
            maxPrice: null,
            search: '',
            distanceEnabled: false,
            userLat: null,
            userLng: null,
            distanceRadius: 5
        };
        
        this.map = null;
        this.userMarker = null;
        this.distanceCircle = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('Starting app initialization...');
            
            await this.loadData();
            await this.loadTemplates();
            this.setupEventListeners();
            this.populateFilters();
            this.renderEvents();
            this.updateStatistics();
            this.showEventsView();
            
            console.log('App initialization complete');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Error al cargar los datos. Por favor, recarga la página.');
        }
    }

    async loadData() {
        this.showLoading(true);
        
        try {
            console.log('Loading data...');
            // Load events data from JSON
            const eventsResponse = await fetch('data/events.json');
            if (!eventsResponse.ok) {
                throw new Error(`HTTP error! status: ${eventsResponse.status}`);
            }
            this.events = await eventsResponse.json();
            console.log('Events loaded:', this.events.length);
            console.log('First event sample:', this.events[0]);
            
            // Load places data from JSON
            const placesResponse = await fetch('data/places.json');
            if (!placesResponse.ok) {
                throw new Error(`HTTP error! status: ${placesResponse.status}`);
            }
            this.places = await placesResponse.json();
            console.log('Places loaded:', this.places.length);
            console.log('First place sample:', this.places[0]);
            
            // Merge events with places data
            this.mergeEventsWithPlaces();
            console.log('Events merged with places');
            
            // Remove duplicates and clean data
            this.cleanEventsData();
            console.log('Events cleaned, final count:', this.events.length);
            console.log('Sample cleaned event:', this.events[0]);
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async loadTemplates() {
        try {
            // Load built-in templates
            this.templates = {
                default: {
                    name: "Clásica",
                    description: "Diseño tradicional con bordes y colores suaves",
                    styles: {
                        headerStyle: 'text-align: center; color: #333; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold;',
                        tableStyle: 'width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px;',
                        thStyle: 'border: 1px solid #ddd; padding: 8px; background-color: #f8f9fa; text-align: center; font-weight: bold;',
                        tdStyle: 'border: 1px solid #ddd; padding: 8px; height: 100px; vertical-align: top;',
                        eventStyle: 'font-size: 9px; margin-bottom: 1px; padding: 2px; background-color: #e3f2fd; border-radius: 2px; line-height: 1.2; word-wrap: break-word; overflow-wrap: break-word;',
                        dayNumberStyle: 'font-weight: bold; margin-bottom: 4px; font-size: 11px; color: #333;'
                    }
                },
                modern: {
                    name: "Moderno",
                    description: "Diseño contemporáneo con gradientes y colores vibrantes",
                    styles: {
                        headerStyle: 'text-align: center; color: #2c3e50; margin-bottom: 20px; font-family: "Segoe UI", Arial, sans-serif; font-size: 26px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);',
                        tableStyle: 'width: 100%; border-collapse: collapse; font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);',
                        thStyle: 'border: 2px solid #3498db; padding: 12px; background: linear-gradient(135deg, #3498db, #2980b9); color: white; text-align: center; font-weight: bold; font-size: 12px;',
                        tdStyle: 'border: 1px solid #bdc3c7; padding: 6px; height: 100px; vertical-align: top; background-color: #fafafa;',
                        eventStyle: 'font-size: 8px; margin-bottom: 2px; padding: 3px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border-radius: 3px; line-height: 1.1; word-wrap: break-word; overflow-wrap: break-word; font-weight: 500;',
                        dayNumberStyle: 'font-weight: bold; margin-bottom: 4px; font-size: 12px; color: #2c3e50; text-align: center;'
                    }
                },
                minimal: {
                    name: "Minimalista",
                    description: "Diseño limpio y simple con líneas sutiles",
                    styles: {
                        headerStyle: 'text-align: center; color: #555; margin-bottom: 15px; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 22px; font-weight: 300; letter-spacing: 1px;',
                        tableStyle: 'width: 100%; border-collapse: collapse; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 10px;',
                        thStyle: 'border: 1px solid #e0e0e0; padding: 10px; background-color: #fafafa; text-align: center; font-weight: 400; color: #666;',
                        tdStyle: 'border: 1px solid #f0f0f0; padding: 8px; height: 100px; vertical-align: top; background-color: #ffffff;',
                        eventStyle: 'font-size: 8px; margin-bottom: 1px; padding: 2px; background-color: #f8f9fa; border-left: 3px solid #666; line-height: 1.2; word-wrap: break-word; overflow-wrap: break-word; color: #333;',
                        dayNumberStyle: 'font-weight: 400; margin-bottom: 6px; font-size: 11px; color: #666; text-align: center;'
                    }
                },
                colorful: {
                    name: "Colorido",
                    description: "Diseño vibrante con colores llamativos y gradientes",
                    styles: {
                        headerStyle: 'text-align: center; color: #8e44ad; margin-bottom: 20px; font-family: "Comic Sans MS", Arial, sans-serif; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(142, 68, 173, 0.3);',
                        tableStyle: 'width: 100%; border-collapse: collapse; font-family: "Comic Sans MS", Arial, sans-serif; font-size: 11px;',
                        thStyle: 'border: 2px solid #9b59b6; padding: 12px; background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; text-align: center; font-weight: bold; font-size: 12px;',
                        tdStyle: 'border: 1px solid #d5b8e7; padding: 6px; height: 100px; vertical-align: top; background: linear-gradient(135deg, #f8f9fa, #e8f4f8);',
                        eventStyle: 'font-size: 8px; margin-bottom: 2px; padding: 3px; background: linear-gradient(135deg, #e67e22, #d35400); color: white; border-radius: 4px; line-height: 1.1; word-wrap: break-word; overflow-wrap: break-word; font-weight: bold; text-shadow: 1px 1px 1px rgba(0,0,0,0.3);',
                        dayNumberStyle: 'font-weight: bold; margin-bottom: 4px; font-size: 12px; color: #8e44ad; text-align: center; text-shadow: 1px 1px 2px rgba(142, 68, 173, 0.2);'
                    }
                },
                "minimal-pink": {
                    name: "Minimal Rosado",
                    description: "Diseño minimalista con colores suaves y tipografía redondeada en tonos rosados y beige.",
                    styles: {
                        headerStyle: "text-align: center; color: #d49696; margin-bottom: 24px; font-family: 'Fredoka One', 'Arial Rounded MT Bold', Arial, sans-serif; font-size: 48px; font-weight: bold; background: none;",
                        tableStyle: "width: 100%; border-collapse: collapse; font-family: 'Arial Rounded MT Bold', Arial, sans-serif; font-size: 16px; background: none;",
                        thStyle: "border: 1px solid #eedee4; padding: 10px; background: #eecaca; color: #864f4f; text-align: center; font-weight: 700; font-size: 14px; letter-spacing: 0.3px;",
                        tdStyle: "border: 1px solid #e6e2dd; padding: 8px; height: 85px; vertical-align: top; background: #fff7ee;",
                        eventStyle: "font-size: 10px; margin-bottom: 2px; padding: 3px; background: #d49696; color: white; border-radius: 4px; line-height: 1.1; word-wrap: break-word; overflow-wrap-word;",
                        dayNumberStyle: "font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #d49696; text-align: right; letter-spacing: 1px;"
                    }
                }
            };

            // Try to load custom templates from templates directory
            try {
                const templateFiles = ['default.json', 'modern.json', 'minimal.json', 'colorful.json'];
                for (const filename of templateFiles) {
                    const response = await fetch(`templates/${filename}`);
                    if (response.ok) {
                        const template = await response.json();
                        this.templates[filename.replace('.json', '')] = template;
                    }
                }
            } catch (error) {
                console.log('No custom templates found, using built-in templates');
            }

            // Populate template selector
            this.populateTemplateSelector();
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    populateTemplateSelector() {
        const templateSelect = document.getElementById('pdf-template');
        if (!templateSelect) return;

        templateSelect.innerHTML = '';
        
        Object.entries(this.templates).forEach(([key, template]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = template.name;
            templateSelect.appendChild(option);
        });
    }

    // Function to format event text with smart line breaks
    formatEventText(text, maxLength = 25) {
        if (!text) return '';
        
        // Remove extra spaces and trim
        text = text.trim().replace(/\s+/g, ' ');
        
        // If text is short enough, return as is
        if (text.length <= maxLength) {
            return text;
        }
        
        // Try to break at natural points (spaces, dashes, etc.)
        const words = text.split(' ');
        let result = '';
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            
            if (testLine.length <= maxLength) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    result += (result ? '\n' : '') + currentLine;
                    currentLine = word;
                } else {
                    // Word is too long, break it
                    if (word.length > maxLength) {
                        const breakPoint = Math.floor(maxLength / 2);
                        result += (result ? '\n' : '') + word.substring(0, breakPoint) + '\n' + word.substring(breakPoint);
                    } else {
                        result += (result ? '\n' : '') + word;
                    }
                }
            }
        }
        
        if (currentLine) {
            result += (result ? '\n' : '') + currentLine;
        }
        
        return result;
    }

    // Function to calculate optimal font size based on text length
    calculateFontSize(text, baseSize = 9) {
        if (!text) return baseSize;
        
        const length = text.length;
        if (length <= 15) return baseSize;
        if (length <= 25) return baseSize - 1;
        if (length <= 35) return baseSize - 2;
        return baseSize - 3;
    }

    mergeEventsWithPlaces() {
        console.log('Merging events with places...');
        console.log('Total places available:', this.places.length);
        
        this.events.forEach(event => {
            const place = this.places.find(p => p.url === event.source_website);
            if (place) {
                event.placeName = place.name;
                event.lat = place.lat;
                event.lng = place.lng;
                event.icon = place.icon ? `data/icons/${place.icon}` : 'data/icons/default-place.jpg';
            } else {
                event.placeName = 'Lugar no especificado';
                event.lat = null;
                event.lng = null;
                event.icon = 'data/icons/default-place.jpg';
            }
        });
        
        // Log summary
        const eventsWithCoords = this.events.filter(e => e.lat && e.lng).length;
        console.log(`Events with coordinates: ${eventsWithCoords}/${this.events.length}`);
    }

    cleanEventsData() {
        // Remove duplicates based on title and datetime
        const seen = new Set();
        this.events = this.events.filter(event => {
            const key = `${event.title}-${event.start_datetime}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });

        // Clean and format data
        this.events = this.events.map(event => ({
            ...event,
            title: event.title || 'Sin título',
            start_datetime: event.start_datetime || '',
            price: event.price || null,
            type: event.type || 'other',
            placeName: event.placeName || 'Lugar no especificado',
            url: event.url || '#',
            duplicated: event.duplicated || false,
            lat: event.lat || null,
            lng: event.lng || null,
            icon: event.icon || null
        })).filter(event => event.start_datetime); // Remove events without datetime
        
        console.log('Events cleaned, final count:', this.events.length);
    }

    setupEventListeners() {
        // Filter event listeners - with safety checks
        const startDate = document.getElementById('start-date');
        const endDate = document.getElementById('end-date');
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        
        if (startDate) startDate.addEventListener('change', () => this.applyFilters());
        if (endDate) endDate.addEventListener('change', () => this.applyFilters());
        if (minPrice) minPrice.addEventListener('input', () => this.applyFilters());
        if (maxPrice) maxPrice.addEventListener('input', () => this.applyFilters());
        
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const clearSearch = document.getElementById('clear-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyFilters());
        }
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                this.applyFilters();
            });
        }
        
        // Place and type search functionality
        const placeSearch = document.getElementById('place-search');
        const typeSearch = document.getElementById('type-search');
        
        if (placeSearch) {
            placeSearch.addEventListener('input', (e) => {
                this.filterPlaceCheckboxes(e.target.value);
            });
        }
        
        if (typeSearch) {
            typeSearch.addEventListener('input', (e) => {
                this.filterTypeCheckboxes(e.target.value);
            });
        }
        
        // Clear filters
        const clearFilters = document.getElementById('clear-filters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearAllFilters());
        }
        
        // Calendar download
        const downloadCalendar = document.getElementById('download-calendar');
        if (downloadCalendar) {
            downloadCalendar.addEventListener('click', () => this.downloadCalendar());
        }
        
        // New download buttons
        const downloadIcs = document.getElementById('download-ics');
        const downloadPdf = document.getElementById('download-pdf');
        
        if (downloadIcs) downloadIcs.addEventListener('click', () => this.downloadCalendar());
        if (downloadPdf) downloadPdf.addEventListener('click', () => this.downloadPDF());
        
        // Navigation
        const navEvents = document.getElementById('nav-events');
        const navCalendar = document.getElementById('nav-calendar');
        const navHelp = document.getElementById('nav-help');
        
        if (navEvents) {
            navEvents.addEventListener('click', (e) => {
                e.preventDefault();
                this.showEventsView();
            });
        }
        
        if (navCalendar) {
            navCalendar.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCalendarView();
            });
        }
        
        if (navHelp) {
            navHelp.addEventListener('click', (e) => {
                e.preventDefault();
                this.showHelpView();
            });
        }
        
        // Distance filter
        const enableDistanceFilter = document.getElementById('enable-distance-filter');
        const distanceRadius = document.getElementById('distance-radius');
        const selectLocation = document.getElementById('select-location');
        
        if (enableDistanceFilter) {
            enableDistanceFilter.addEventListener('change', (e) => {
                const distanceControls = document.getElementById('distance-controls');
                if (distanceControls) {
                    distanceControls.style.display = e.target.checked ? 'block' : 'none';
                }
                
                // Update current filters to capture the new state
                this.updateCurrentFilters();
                
                // Apply filters immediately
                this.applyFilters();
                
                console.log('Distance filter toggled:', {
                    enabled: e.target.checked,
                    currentFilters: this.currentFilters
                });
            });
        }
        
        if (distanceRadius) {
            distanceRadius.addEventListener('input', (e) => {
                const radiusValue = document.getElementById('radius-value');
                const mapRadiusSlider = document.getElementById('map-distance-radius');
                const mapRadiusValue = document.getElementById('map-radius-value');
                
                if (radiusValue) {
                    radiusValue.textContent = `${e.target.value} km`;
                }
                
                // Synchronize with map slider
                if (mapRadiusSlider) {
                    mapRadiusSlider.value = e.target.value;
                }
                if (mapRadiusValue) {
                    mapRadiusValue.textContent = `${e.target.value} km`;
                }
                
                // Update current filters to capture the new radius
                this.updateCurrentFilters();
                
                // Update visual circle on map
                this.updateDistanceCircle();
                
                // Apply filters immediately
                this.applyFilters();
                
                console.log('Distance radius changed:', {
                    radius: e.target.value,
                    currentFilters: this.currentFilters
                });
            });
        }
        
        if (selectLocation) {
            selectLocation.addEventListener('click', () => {
                this.showMapModal();
            });
        }
        
        // Map modal events
        const mapModal = document.getElementById('mapModal');
        if (mapModal) {
            mapModal.addEventListener('shown.bs.modal', () => {
                this.initializeMap();
            });
        }
        
        // Map distance radius (synchronized with main filter)
        const mapDistanceRadius = document.getElementById('map-distance-radius');
        if (mapDistanceRadius) {
            mapDistanceRadius.addEventListener('input', (e) => {
                const mapRadiusValue = document.getElementById('map-radius-value');
                const mainRadiusSlider = document.getElementById('distance-radius');
                const mainRadiusValue = document.getElementById('radius-value');
                
                if (mapRadiusValue) {
                    mapRadiusValue.textContent = `${e.target.value} km`;
                }
                
                // Synchronize with main slider
                if (mainRadiusSlider) {
                    mainRadiusSlider.value = e.target.value;
                }
                if (mainRadiusValue) {
                    mainRadiusValue.textContent = `${e.target.value} km`;
                }
                
                this.currentFilters.distanceRadius = parseInt(e.target.value);
                this.updateDistanceCircle();
                this.applyFilters();
            });
        }
        
        // Confirm location button
        const confirmLocation = document.getElementById('confirm-location');
        if (confirmLocation) {
            confirmLocation.addEventListener('click', () => {
                this.confirmLocation();
            });
        }
        
        // Calendar preview functionality
        const previewCalendarBtn = document.getElementById('preview-calendar');
        if (previewCalendarBtn) {
            previewCalendarBtn.addEventListener('click', () => this.showCalendarPreview());
        }
        
        // Preview modal event listeners
        const updatePreviewBtn = document.getElementById('update-preview');
        if (updatePreviewBtn) {
            updatePreviewBtn.addEventListener('click', () => this.updateCalendarPreview());
        }
        
        const previewTemplateSelect = document.getElementById('preview-template');
        if (previewTemplateSelect) {
            previewTemplateSelect.addEventListener('change', (e) => {
                this.updatePreviewTemplateDescription(e.target.value);
                this.updateCalendarPreview();
            });
        }
        
        const previewEventsCheckbox = document.getElementById('preview-events');
        if (previewEventsCheckbox) {
            previewEventsCheckbox.addEventListener('change', () => this.updateCalendarPreview());
        }
        
        const downloadFromPreviewBtn = document.getElementById('download-from-preview');
        if (downloadFromPreviewBtn) {
            downloadFromPreviewBtn.addEventListener('click', () => this.downloadPDFFromPreview());
        }
        
        console.log('Event listeners set up successfully');
    }

    populateFilters() {
        console.log('Populating filters...');
        console.log('Total events:', this.events.length);
        
        if (!this.events || this.events.length === 0) {
            console.warn('No events available for filtering');
            return;
        }
        
        // Populate places filter with checkboxes
        const places = [...new Set(this.events.map(e => e.placeName).filter(p => p))].sort();
        console.log('Unique places found:', places.length);
        
        const placeCheckboxes = document.getElementById('place-checkboxes');
        if (!placeCheckboxes) {
            console.error('place-checkboxes element not found!');
            return;
        }
        
        placeCheckboxes.innerHTML = '';
        
        places.forEach(place => {
            if (!place) return; // Skip empty places
            
            const div = document.createElement('div');
            div.className = 'form-check';
            const safeId = place.replace(/[^a-zA-Z0-9]/g, '-');
            div.innerHTML = `
                <input class="form-check-input place-checkbox" type="checkbox" id="place-${safeId}" value="${place}">
                <label class="form-check-label" for="place-${safeId}">
                    ${place}
                </label>
            `;
            placeCheckboxes.appendChild(div);
        });

        // Populate event types filter with checkboxes
        const types = [...new Set(this.events.map(e => e.type).filter(t => t))].sort();
        console.log('Unique types found:', types.length);
        
        const typeCheckboxes = document.getElementById('type-checkboxes');
        if (!typeCheckboxes) {
            console.error('type-checkboxes element not found!');
            return;
        }
        
        typeCheckboxes.innerHTML = '';
        
        types.forEach(type => {
            if (!type) return; // Skip empty types
            
            const div = document.createElement('div');
            div.className = 'form-check';
            const safeId = type.replace(/[^a-zA-Z0-9]/g, '-');
            div.innerHTML = `
                <input class="form-check-input type-checkbox" type="checkbox" id="type-${safeId}" value="${type}">
                <label class="form-check-label" for="type-${safeId}">
                    ${this.getTypeDisplayName(type)}
                </label>
            `;
            typeCheckboxes.appendChild(div);
        });

        console.log('Filters populated successfully');
        console.log('Place checkboxes created:', placeCheckboxes.children.length);
        console.log('Type checkboxes created:', typeCheckboxes.children.length);
        
        // Add event listeners for "select all" checkboxes
        this.setupSelectAllListeners();
    }

    setupSelectAllListeners() {
        // Place "select all" functionality
        const placeAllCheckbox = document.getElementById('place-all');
        const placeCheckboxes = document.querySelectorAll('.place-checkbox');
        
        if (placeAllCheckbox && placeCheckboxes.length > 0) {
            placeAllCheckbox.addEventListener('change', (e) => {
                placeCheckboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    this.updateCheckboxVisual(checkbox);
                });
                this.applyFilters();
            });
        }

        // Type "select all" functionality
        const typeAllCheckbox = document.getElementById('type-all');
        const typeCheckboxes = document.querySelectorAll('.type-checkbox');
        
        if (typeAllCheckbox && typeCheckboxes.length > 0) {
            typeAllCheckbox.addEventListener('change', (e) => {
                typeCheckboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    this.updateCheckboxVisual(checkbox);
                });
                this.applyFilters();
            });
        }

        // Individual checkbox listeners
        placeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCheckboxVisual(checkbox);
                if (placeAllCheckbox) {
                    this.updateSelectAllState(placeAllCheckbox, placeCheckboxes);
                }
                this.applyFilters();
            });
        });

        typeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCheckboxVisual(checkbox);
                if (typeAllCheckbox) {
                    this.updateSelectAllState(typeAllCheckbox, typeCheckboxes);
                }
                this.applyFilters();
            });
        });
        
        console.log('Select all listeners set up:', {
            placeCheckboxes: placeCheckboxes.length,
            typeCheckboxes: typeCheckboxes.length
        });
    }
    
    updateCheckboxVisual(checkbox) {
        const formCheck = checkbox.closest('.form-check');
        if (!formCheck) return;
        
        if (checkbox.checked) {
            formCheck.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            formCheck.style.border = '1px solid rgba(59, 130, 246, 0.3)';
            formCheck.style.padding = '0.5rem';
            formCheck.style.margin = '0.25rem 0';
            
            const label = formCheck.querySelector('.form-check-label');
            if (label) {
                label.style.color = '#3b82f6';
                label.style.fontWeight = '500';
            }
        } else {
            formCheck.style.backgroundColor = 'transparent';
            formCheck.style.border = 'none';
            formCheck.style.padding = '0.25rem 0';
            formCheck.style.margin = '0 0 0.5rem 0';
            
            const label = formCheck.querySelector('.form-check-label');
            if (label) {
                label.style.color = '#e2e8f0';
                label.style.fontWeight = 'normal';
            }
        }
    }

    updateSelectAllState(selectAllCheckbox, individualCheckboxes) {
        const checkedCount = Array.from(individualCheckboxes).filter(cb => cb.checked).length;
        const totalCount = individualCheckboxes.length;
        
        if (checkedCount === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedCount === totalCount) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
            selectAllCheckbox.checked = false;
        }
    }

    getTypeDisplayName(type) {
        const typeNames = {
            'music': 'Música',
            'theater': 'Teatro',
            'art': 'Arte',
            'dance': 'Danza',
            'literature': 'Literatura',
            'film': 'Cine',
            'workshop': 'Taller',
            'exhibition': 'Exposición',
            'festival': 'Festival',
            'conference': 'Conferencia',
            'party': 'Fiesta',
            'show': 'Show',
            'lecture': 'Conferencia',
            'discussion': 'Debate',
            'march': 'Marcha',
            'other': 'Otro',
            // Add Spanish types from the data
            'Musica': 'Música',
            'Teatro': 'Teatro',
            'Arte': 'Arte',
            'Danza': 'Danza',
            'Literatura': 'Literatura',
            'Cine': 'Cine',
            'Taller': 'Taller',
            'Exposicion': 'Exposición',
            'Festival': 'Festival',
            'Conferencia': 'Conferencia',
            'Fiesta': 'Fiesta',
            'Show': 'Show',
            'Debate': 'Debate',
            'Marcha': 'Marcha',
            'Otros': 'Otros'
        };
        return typeNames[type] || type;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in kilometers
        return distance;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Helper functions for date handling
    parseDateString(dateString) {
        // Parse date string in format YYYY-MM-DD and return Date object at 00:00:00 local time
        try {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day, 0, 0, 0, 0);
        } catch (error) {
            console.error('Error parsing date:', dateString, error);
            // Fallback to original Date constructor
            return new Date(dateString);
        }
    }

    parseDateTimeString(dateTimeString) {
        // Parse datetime string in format YYYY-MM-DDTHH:MM:SS or YYYY-MM-DDTHH:MM or YYYY-MM-DD
        // This preserves the exact time without timezone conversion
        try {
            if (dateTimeString.includes('T')) {
                const [datePart, timePart] = dateTimeString.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                
                if (timePart) {
                    const timeComponents = timePart.split(':').map(Number);
                    const hour = timeComponents[0] || 0;
                    const minute = timeComponents[1] || 0;
                    const second = timeComponents[2] || 0;
                    return new Date(year, month - 1, day, hour, minute, second, 0);
                } else {
                    // Only date, no time - default to 00:00:00
                    return new Date(year, month - 1, day, 0, 0, 0, 0);
                }
            } else {
                // Only date format YYYY-MM-DD
                const [year, month, day] = dateTimeString.split('-').map(Number);
                return new Date(year, month - 1, day, 0, 0, 0, 0);
            }
        } catch (error) {
            console.error('Error parsing datetime:', dateTimeString, error);
            // Fallback to original Date constructor
            return new Date(dateTimeString);
        }
    }

    // Helper function to create date range for filtering
    createDateRange(startDateStr, endDateStr) {
        const startDate = this.parseDateString(startDateStr);
        const endDate = this.parseDateString(endDateStr);
        
        // End date should include events until 6 AM of the next day
        const endDatePlus6Hours = new Date(endDate);
        endDatePlus6Hours.setDate(endDatePlus6Hours.getDate() + 1);
        endDatePlus6Hours.setHours(6, 0, 0, 0);
        
        return {
            start: startDate,
            end: endDatePlus6Hours
        };
    }

    // Helper functions for detecting invalid data
    isInvalidPrice(price) {
        return price === null || price === undefined || isNaN(price) || price === '';
    }

    isInvalidTime(dateTimeString) {
        try {
            const date = this.parseDateTimeString(dateTimeString);
            // Check if time is 00:00:00 (midnight) which usually means no time was specified
            return date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0;
        } catch (error) {
            return true;
        }
    }

    formatPriceDisplay(price) {
        if (this.isInvalidPrice(price)) {
            return '<span class="text-muted"><i class="bi bi-exclamation-triangle me-1"></i>Precio no detectado</span>';
        }
        if (price === 0) {
            return '<span class="price-free">Gratis</span>';
        }
        return `<span class="price-paid">$${price.toLocaleString()}</span>`;
    }

    formatTimeDisplay(dateTimeString) {
        if (this.isInvalidTime(dateTimeString)) {
            const date = this.parseDateTimeString(dateTimeString);
            return `<span class="text-muted"><i class="bi bi-exclamation-triangle me-1"></i>Hora no detectada</span><br><small>${date.toLocaleDateString('es-AR', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })}</small>`;
        }
        
        const date = this.parseDateTimeString(dateTimeString);
        return date.toLocaleDateString('es-AR', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    applyFilters() {
        this.updateCurrentFilters();
        console.log('Applying filters...');
        console.log('Current filters:', this.currentFilters);
        console.log('Total events before filtering:', this.events.length);
        
        // Log first few events to see their datetime format
        console.log('First 3 events datetime format:');
        this.events.slice(0, 3).forEach((event, index) => {
            console.log(`Event ${index + 1}:`, event.start_datetime);
        });
        
        // Log date range if set
        if (this.currentFilters.startDate || this.currentFilters.endDate) {
            console.log('Date filter active:');
            if (this.currentFilters.startDate && this.currentFilters.endDate) {
                const dateRange = this.createDateRange(this.currentFilters.startDate, this.currentFilters.endDate);
                console.log('Date range:', {
                    start: dateRange.start.toISOString(),
                    end: dateRange.end.toISOString(),
                    startLocal: dateRange.start.toLocaleString('es-AR'),
                    endLocal: dateRange.end.toLocaleString('es-AR')
                });
            } else if (this.currentFilters.startDate) {
                const startDate = this.parseDateString(this.currentFilters.startDate);
                console.log('Start date only:', startDate.toLocaleString('es-AR'));
            } else if (this.currentFilters.endDate) {
                const endDate = this.parseDateString(this.currentFilters.endDate);
                const endDatePlus6Hours = new Date(endDate);
                endDatePlus6Hours.setDate(endDatePlus6Hours.getDate() + 1);
                endDatePlus6Hours.setHours(6, 0, 0, 0);
                console.log('End date only:', endDatePlus6Hours.toLocaleString('es-AR'));
            }
        }
        
        // Log distance filter state
        if (this.currentFilters.distanceEnabled) {
            console.log('Distance filter is enabled:', {
                userLat: this.currentFilters.userLat,
                userLng: this.currentFilters.userLng,
                distanceRadius: this.currentFilters.distanceRadius
            });
        } else {
            console.log('Distance filter is disabled');
        }
        
        let filteredCount = 0;
        let dateFilteredCount = 0;
        let placeFilteredCount = 0;
        let priceFilteredCount = 0;
        let typeFilteredCount = 0;
        let searchFilteredCount = 0;
        let distanceFilteredCount = 0;
        
        this.filteredEvents = this.events.filter(event => {
            // Date filter - Fixed to be inclusive and include events until 6 AM next day
            if (this.currentFilters.startDate || this.currentFilters.endDate) {
                const eventDate = this.parseDateTimeString(event.start_datetime);
                
                // If only start date is set
                if (this.currentFilters.startDate && !this.currentFilters.endDate) {
                    const startDate = this.parseDateString(this.currentFilters.startDate);
                    if (eventDate < startDate) {
                        dateFilteredCount++;
                        return false;
                    }
                }
                
                // If only end date is set
                if (!this.currentFilters.startDate && this.currentFilters.endDate) {
                    const endDate = this.parseDateString(this.currentFilters.endDate);
                    const endDatePlus6Hours = new Date(endDate);
                    endDatePlus6Hours.setDate(endDatePlus6Hours.getDate() + 1);
                    endDatePlus6Hours.setHours(6, 0, 0, 0);
                    
                    if (eventDate > endDatePlus6Hours) {
                        dateFilteredCount++;
                        return false;
                    }
                }
                
                // If both start and end dates are set
                if (this.currentFilters.startDate && this.currentFilters.endDate) {
                    const dateRange = this.createDateRange(this.currentFilters.startDate, this.currentFilters.endDate);
                    
                    if (eventDate < dateRange.start || eventDate > dateRange.end) {
                        dateFilteredCount++;
                        return false;
                    }
                }
            }
            
            // Place filter - Multiple selection
            if (this.currentFilters.places.length > 0 && !this.currentFilters.places.includes(event.placeName)) {
                placeFilteredCount++;
                return false;
            }
            
            // Price filter
            if (this.currentFilters.minPrice && !this.isInvalidPrice(event.price) && event.price < parseFloat(this.currentFilters.minPrice)) {
                priceFilteredCount++;
                return false;
            }
            if (this.currentFilters.maxPrice && !this.isInvalidPrice(event.price) && event.price > parseFloat(this.currentFilters.maxPrice)) {
                priceFilteredCount++;
                return false;
            }
            
            // Type filter - Multiple selection
            if (this.currentFilters.types.length > 0 && !this.currentFilters.types.includes(event.type)) {
                typeFilteredCount++;
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const title = event.title.toLowerCase();
                const place = event.placeName.toLowerCase();
                if (!title.includes(searchTerm) && !place.includes(searchTerm)) {
                    searchFilteredCount++;
                    return false;
                }
            }
            
            // Distance filter
            if (this.currentFilters.distanceEnabled && this.currentFilters.userLat && this.currentFilters.userLng && event.lat && event.lng) {
                const distance = this.calculateDistance(
                    this.currentFilters.userLat, 
                    this.currentFilters.userLng, 
                    event.lat, 
                    event.lng
                );
                
                console.log(`Distance check for "${event.title}": ${distance.toFixed(2)}km (max: ${this.currentFilters.distanceRadius}km)`);
                
                if (distance > this.currentFilters.distanceRadius) {
                    distanceFilteredCount++;
                    console.log(`Event "${event.title}" filtered out by distance: ${distance.toFixed(2)}km > ${this.currentFilters.distanceRadius}km`);
                    return false;
                }
            } else if (this.currentFilters.distanceEnabled) {
                console.log(`Distance filter enabled but missing data for "${event.title}":`, {
                    userLat: this.currentFilters.userLat,
                    userLng: this.currentFilters.userLng,
                    eventLat: event.lat,
                    eventLng: event.lng,
                    hasUserLocation: !!(this.currentFilters.userLat && this.currentFilters.userLng),
                    hasEventLocation: !!(event.lat && event.lng)
                });
            }
            
            filteredCount++;
            return true;
        });
        
        console.log('Filter breakdown:');
        console.log('- Date filtered out:', dateFilteredCount);
        console.log('- Place filtered out:', placeFilteredCount);
        console.log('- Price filtered out:', priceFilteredCount);
        console.log('- Type filtered out:', typeFilteredCount);
        console.log('- Search filtered out:', searchFilteredCount);
        console.log('- Distance filtered out:', distanceFilteredCount);
        console.log('- Passed all filters:', filteredCount);
        console.log('Filtered events:', this.filteredEvents.length);
        
        this.renderEvents();
        this.updateStatistics();
    }

    updateCurrentFilters() {
        // Read distance filter state from DOM
        const enableDistanceFilter = document.getElementById('enable-distance-filter');
        const distanceRadius = document.getElementById('distance-radius');
        
        this.currentFilters = {
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            places: this.getSelectedPlaces(),
            minPrice: document.getElementById('min-price').value,
            maxPrice: document.getElementById('max-price').value,
            types: this.getSelectedTypes(),
            search: document.getElementById('search-input').value,
            distanceEnabled: enableDistanceFilter ? enableDistanceFilter.checked : this.currentFilters.distanceEnabled,
            userLat: this.currentFilters.userLat,
            userLng: this.currentFilters.userLng,
            distanceRadius: distanceRadius ? parseInt(distanceRadius.value) : this.currentFilters.distanceRadius
        };
        
        console.log('Updated current filters:', this.currentFilters);
    }

    getSelectedPlaces() {
        const placeCheckboxes = document.querySelectorAll('.place-checkbox');
        return Array.from(placeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    }

    getSelectedTypes() {
        const typeCheckboxes = document.querySelectorAll('.type-checkbox');
        return Array.from(typeCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    }

    clearAllFilters() {
        // Clear date filters
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        
        // Clear price filters
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        
        // Clear search
        document.getElementById('search-input').value = '';
        
        // Clear place filters
        document.querySelectorAll('.place-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('place-all').checked = false;
        document.getElementById('place-all').indeterminate = false;
        document.getElementById('place-search').value = '';
        
        // Clear type filters
        document.querySelectorAll('.type-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('type-all').checked = false;
        document.getElementById('type-all').indeterminate = false;
        document.getElementById('type-search').value = '';
        
        // Clear distance filter
        const enableDistanceFilter = document.getElementById('enable-distance-filter');
        const distanceControls = document.getElementById('distance-controls');
        const selectedLocationInfo = document.getElementById('selected-location-info');
        
        if (enableDistanceFilter) {
            enableDistanceFilter.checked = false;
        }
        if (distanceControls) {
            distanceControls.style.display = 'none';
        }
        if (selectedLocationInfo) {
            selectedLocationInfo.style.display = 'none';
        }
        
        // Reset distance filter state
        this.currentFilters.distanceEnabled = false;
        this.currentFilters.userLat = null;
        this.currentFilters.userLng = null;
        this.selectedLocation = null;
        
        // Reset current filters
        this.currentFilters = {
            startDate: null,
            endDate: null,
            minPrice: null,
            maxPrice: null,
            places: [],
            types: [],
            search: '',
            distanceEnabled: false,
            distanceRadius: 5,
            userLat: null,
            userLng: null
        };
        
        this.applyFilters();
    }

    // Clear edited events (useful for debugging or reset)
    clearEditedEvents() {
        localStorage.removeItem('editedEvents');
        this.renderSelectedEvents();
        this.showSuccess('Ediciones de eventos limpiadas');
    }

    renderEvents() {
        const eventsGrid = document.getElementById('events-grid');
        const noEventsDiv = document.getElementById('no-events');
        
        if (this.filteredEvents.length === 0) {
            eventsGrid.style.display = 'none';
            noEventsDiv.style.display = 'block';
            noEventsDiv.classList.add('fade-in-up');
            return;
        }
        
        eventsGrid.style.display = 'flex';
        noEventsDiv.style.display = 'none';
        
        eventsGrid.innerHTML = '';
        
        // Ordenar eventos: 1) fecha (no detectada al final), 2) precio (gratis primero, luego más bajo, luego no detectado), 3) lugar
        this.filteredEvents.sort((a, b) => {
            // 1. Fecha (no detectada al final)
            const isDateAInvalid = !a.start_datetime || isNaN(new Date(a.start_datetime).getTime());
            const isDateBInvalid = !b.start_datetime || isNaN(new Date(b.start_datetime).getTime());
            if (isDateAInvalid && !isDateBInvalid) return 1;
            if (!isDateAInvalid && isDateBInvalid) return -1;
            if (!isDateAInvalid && !isDateBInvalid) {
                const dateA = new Date(a.start_datetime);
                const dateB = new Date(b.start_datetime);
                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;
            }
            // 2. Precio (null/undefined/NaN al final)
            const priceA = (a.price === null || a.price === undefined || isNaN(a.price)) ? Infinity : a.price;
            const priceB = (b.price === null || b.price === undefined || isNaN(b.price)) ? Infinity : b.price;
            if (priceA < priceB) return -1;
            if (priceA > priceB) return 1;
            // 3. Lugar (alfabético)
            const placeA = (a.placeName || '').toLowerCase();
            const placeB = (b.placeName || '').toLowerCase();
            if (placeA < placeB) return -1;
            if (placeA > placeB) return 1;
            return 0;
        });

        // Log de diagnóstico: mostrar el orden de los eventos renderizados
        console.log('Eventos a mostrar (ordenados):');
        this.filteredEvents.forEach(ev => {
            console.log(`- ${ev.title} | Fecha: ${ev.start_datetime} | Precio: ${ev.price} | Lugar: ${ev.placeName}`);
        });

        this.filteredEvents.forEach((event, index) => {
            const eventCard = this.createEventCard(event);
            eventCard.style.animationDelay = `${index * 0.1}s`;
            eventCard.classList.add('fade-in-up');
            eventsGrid.appendChild(eventCard);
        });
    }

    createEventCard(event) {
        const eventKey = `${event.title}-${event.start_datetime}-${event.placeName}`;
        const isSelected = this.selectedEvents.has(eventKey);
        
        const card = document.createElement('div');
        card.className = `col event-card ${isSelected ? 'added-to-calendar' : ''}`;
        card.dataset.eventKey = eventKey;
        
        const placeIcon = event.icon || 'data/icons/default-place.jpg';
        const priceDisplay = this.formatPriceDisplay(event.price);
        const timeDisplay = this.formatTimeDisplay(event.start_datetime);
        const typeDisplay = this.getTypeDisplayName(event.type);
        
        card.innerHTML = `
            <div class="card-body d-flex flex-column">
                <div class="d-flex align-items-start mb-3">
                    <img src="${placeIcon}" alt="${event.placeName}" class="place-icon me-3" 
                         onerror="this.src='data/icons/default-place.jpg'">
                    <div class="flex-grow-1">
                        <h5 class="card-title">${this.escapeHtml(event.title)}</h5>
                        <div class="event-info">
                            <i class="bi bi-calendar-event"></i>
                            <span>${timeDisplay}</span>
                        </div>
                        <div class="event-info">
                            <i class="bi bi-geo-alt"></i>
                            <span>${this.escapeHtml(event.placeName)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="badge bg-primary">${typeDisplay}</span>
                        <span class="badge bg-success">${priceDisplay}</span>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary btn-sm btn-add-calendar" 
                                onclick="app.toggleEventSelection('${eventKey}')">
                            ${isSelected ? '✓ Agregado al Calendario' : 'Agregar al Calendario'}
                        </button>
                        <div class="d-flex gap-1">
                            <button class="btn btn-outline-secondary btn-sm flex-grow-1" 
                                    onclick="app.showEventDetails('${eventKey}')" 
                                    title="Ver detalles">
                                <i class="bi bi-info-circle me-1"></i>Ver Detalles
                            </button>
                            <button class="btn btn-outline-warning btn-sm flex-grow-1" 
                                    onclick="app.showReportErrorModal('${eventKey}')" 
                                    title="Reportar error">
                                <i class="bi bi-exclamation-triangle me-1"></i>Reportar Error
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }

    showEventDetails(eventKey) {
        const event = this.events.find(e => `${e.title}-${e.start_datetime}-${e.placeName}` === eventKey);
        if (!event) return;
        
        const modal = document.getElementById('eventModal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        
        const placeIcon = event.icon || 'data/icons/default-place.jpg';
        const priceDisplay = this.formatPriceDisplay(event.price);
        const timeDisplay = this.formatTimeDisplay(event.start_datetime);
        const typeDisplay = this.getTypeDisplayName(event.type);
        
        modalTitle.textContent = event.title;
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${placeIcon}" alt="${event.placeName}" class="img-fluid rounded" 
                         onerror="this.src='data/icons/default-place.jpg'">
                </div>
                <div class="col-md-8">
                    <h6>Detalles del Evento</h6>
                    <p><strong>Fecha:</strong> ${timeDisplay}</p>
                    <p><strong>Lugar:</strong> ${this.escapeHtml(event.placeName)}</p>
                    <p><strong>Tipo:</strong> ${typeDisplay}</p>
                    <p><strong>Precio:</strong> ${priceDisplay}</p>
                    ${event.url ? `<p><strong>Enlace:</strong> <a href="${event.url}" target="_blank">Ver más información</a></p>` : ''}
                </div>
            </div>
            <div class="mt-3">
                <h6>Descripción</h6>
                <p>${this.escapeHtml(event.description || 'Sin descripción disponible')}</p>
            </div>
        `;
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    showReportErrorModal(eventKey) {
        const event = this.events.find(e => `${e.title}-${e.start_datetime}-${e.placeName}` === eventKey);
        if (!event) return;
        
        const modal = document.getElementById('reportErrorModal');
        const modalTitle = modal.querySelector('.modal-title');
        const eventTitleInput = modal.querySelector('#error-event-title');
        
        modalTitle.textContent = `Reportar Error - ${event.title}`;
        eventTitleInput.value = event.title;
        
        // Store the event key for the report
        modal.dataset.eventKey = eventKey;
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }

    toggleEventSelection(eventKey) {
        if (this.selectedEvents.has(eventKey)) {
            this.selectedEvents.delete(eventKey);
        } else {
            this.selectedEvents.add(eventKey);
        }
        
        // Update the event card visual state
        const eventCard = document.querySelector(`[data-event-key="${eventKey}"]`);
        if (eventCard) {
            if (this.selectedEvents.has(eventKey)) {
                eventCard.classList.add('added-to-calendar');
                const addButton = eventCard.querySelector('.btn-add-calendar');
                if (addButton) {
                    addButton.textContent = '✓ Agregado al Calendario';
                }
            } else {
                eventCard.classList.remove('added-to-calendar');
                const addButton = eventCard.querySelector('.btn-add-calendar');
                if (addButton) {
                    addButton.textContent = 'Agregar al Calendario';
                }
            }
        }
        
        this.updateSelectedCount();
        this.updateDownloadButton();
    }

    updateSelectedCount() {
        const countElement = document.getElementById('selected-count');
        countElement.textContent = this.selectedEvents.size;
    }

    updateDownloadButton() {
        const downloadButton = document.getElementById('download-calendar');
        const downloadButtons = document.getElementById('download-buttons');
        
        if (this.selectedEvents.size > 0) {
            downloadButton.disabled = false;
            downloadButtons.style.display = 'block';
        } else {
            downloadButton.disabled = true;
            downloadButtons.style.display = 'none';
        }
    }

    updateStatistics() {
        document.getElementById('total-events').textContent = this.events.length;
        document.getElementById('filtered-events').textContent = this.filteredEvents.length;
    }

    showEventsView() {
        document.getElementById('events-view').style.display = 'block';
        document.getElementById('calendar-view').style.display = 'none';
        document.getElementById('help-view').style.display = 'none';
        
        document.getElementById('nav-events').classList.add('active');
        document.getElementById('nav-calendar').classList.remove('active');
        document.getElementById('nav-help').classList.remove('active');
    }

    showCalendarView() {
        document.getElementById('events-view').style.display = 'none';
        document.getElementById('calendar-view').style.display = 'block';
        document.getElementById('help-view').style.display = 'none';
        
        document.getElementById('nav-events').classList.remove('active');
        document.getElementById('nav-calendar').classList.add('active');
        document.getElementById('nav-help').classList.remove('active');
        
        this.renderSelectedEvents();
    }

    showHelpView() {
        document.getElementById('events-view').style.display = 'none';
        document.getElementById('calendar-view').style.display = 'none';
        document.getElementById('help-view').style.display = 'block';
        
        document.getElementById('nav-events').classList.remove('active');
        document.getElementById('nav-calendar').classList.remove('active');
        document.getElementById('nav-help').classList.add('active');
    }

    renderSelectedEvents() {
        const container = document.getElementById('selected-events-list');
        const noEventsDiv = document.getElementById('no-selected-events');
        const downloadButtons = document.getElementById('download-buttons');
        
        if (this.selectedEvents.size === 0) {
            container.innerHTML = '';
            noEventsDiv.style.display = 'block';
            downloadButtons.style.display = 'none';
            return;
        }
        
        noEventsDiv.style.display = 'none';
        downloadButtons.style.display = 'block';
        
        const selectedEventsWithEdits = this.getSelectedEventsWithEdits();
        
        container.innerHTML = selectedEventsWithEdits.map(event => {
            const eventKey = `${event.title}-${event.start_datetime}-${event.placeName}`;
            const placeIcon = event.icon || 'data/icons/default-place.jpg';
            const priceDisplay = this.formatPriceDisplay(event.price);
            const timeDisplay = this.formatTimeDisplay(event.start_datetime);
            const typeDisplay = this.getTypeDisplayName(event.type);
            
            return `
                <div class="card mb-3 event-card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-2">
                                <img src="${placeIcon}" alt="${event.placeName}" class="img-fluid rounded" 
                                     onerror="this.src='data/icons/default-place.jpg'">
                            </div>
                            <div class="col-md-8">
                                <h5 class="card-title">${this.escapeHtml(event.title)}</h5>
                                <p class="card-text">
                                    <i class="bi bi-calendar-event me-2"></i>${timeDisplay}<br>
                                    <i class="bi bi-geo-alt me-2"></i>${this.escapeHtml(event.placeName)}<br>
                                    <i class="bi bi-tag me-2"></i>${typeDisplay}<br>
                                    <i class="bi bi-currency-dollar me-2"></i>${priceDisplay}
                                </p>
                                ${event.url ? `<p><i class="bi bi-link-45deg me-2"></i><a href="${event.url}" target="_blank">Ver más información</a></p>` : ''}
                            </div>
                            <div class="col-md-2">
                                <div class="d-flex flex-column gap-2">
                                    <button class="btn btn-outline-primary btn-sm" onclick="app.editEvent('${eventKey}')">
                                        <i class="bi bi-pencil me-1"></i>Editar
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="app.removeFromCalendar('${eventKey}')">
                                        <i class="bi bi-trash me-1"></i>Quitar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    removeFromCalendar(eventKey) {
        this.selectedEvents.delete(eventKey);
        this.updateSelectedCount();
        this.updateDownloadButton();
        this.renderSelectedEvents();
        
        // Update the event card in the main view if it exists
        const eventCard = document.querySelector(`[data-event-key="${eventKey}"]`);
        if (eventCard) {
            eventCard.classList.remove('added-to-calendar');
            const addButton = eventCard.querySelector('.btn-add-calendar');
            if (addButton) {
                addButton.textContent = 'Agregar al Calendario';
            }
        }
        
        this.showSuccess('Evento removido del calendario.');
    }

    showMapModal() {
        const modal = new bootstrap.Modal(document.getElementById('mapModal'));
        
        // Synchronize the map distance radius with the main filter
        const mapRadiusSlider = document.getElementById('map-distance-radius');
        const mapRadiusValue = document.getElementById('map-radius-value');
        const mainRadiusSlider = document.getElementById('distance-radius');
        const mainRadiusValue = document.getElementById('radius-value');
        
        // Get current radius from main slider
        const currentRadius = mainRadiusSlider ? mainRadiusSlider.value : 5;
        
        // Update map slider
        if (mapRadiusSlider) {
            mapRadiusSlider.value = currentRadius;
        }
        if (mapRadiusValue) {
            mapRadiusValue.textContent = `${currentRadius} km`;
        }
        
        // Update main slider display
        if (mainRadiusValue) {
            mainRadiusValue.textContent = `${currentRadius} km`;
        }
        
        // Show modal first
        modal.show();
        
        // Initialize map after modal is fully shown and visible
        const mapModal = document.getElementById('mapModal');
        const handleModalShown = () => {
            // Remove the event listener to avoid multiple initializations
            mapModal.removeEventListener('shown.bs.modal', handleModalShown);
            // Initialize map with a small delay to ensure modal is fully rendered
            setTimeout(() => {
                this.initializeMap();
            }, 50);
        };
        
        mapModal.addEventListener('shown.bs.modal', handleModalShown);
    }

    initializeMap() {
        if (this.map) {
            this.map.remove();
        }
        
        // Show loading indicator for map
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando mapa...</span></div></div>';
        
        // Initialize map centered on Buenos Aires with optimized settings
        this.map = L.map('map', {
            center: [-34.6037, -58.3816],
            zoom: 12,
            zoomControl: false, // Disable zoom controls
            attributionControl: true,
            // Optimize rendering performance
            preferCanvas: true
        });
        
        // Use a faster tile provider with better caching
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            // Optimize tile loading
            maxZoom: 18,
            // Enable tile caching
            updateWhenIdle: true,
            updateWhenZooming: false
        }).addTo(this.map);
        
        // Add loading event listeners
        tileLayer.on('loading', () => {
            if (!mapContainer.querySelector('.spinner-border')) {
                mapContainer.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando mapa...</span></div></div>';
            }
        });
        
        tileLayer.on('load', () => {
            // Map is loaded, remove loading indicator
            const spinner = mapContainer.querySelector('.spinner-border');
            if (spinner) {
                spinner.parentElement.remove();
            }
        });
        
        // Add click handler for user location
        this.map.on('click', (e) => {
            this.setUserLocation(e.latlng);
        });
        
        // Force a map refresh to ensure proper rendering
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }
    
    setUserLocation(latlng) {
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }
        
        if (this.distanceCircle) {
            this.map.removeLayer(this.distanceCircle);
        }
        
        this.userMarker = L.marker(latlng, {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: '<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(this.map);
        
        this.currentFilters.userLat = latlng.lat;
        this.currentFilters.userLng = latlng.lng;
        
        // Show selected location in the filter
        const selectedLocationInfo = document.getElementById('selected-location-info');
        const selectedLatLng = document.getElementById('selected-lat-lng');
        
        if (selectedLocationInfo && selectedLatLng) {
            selectedLocationInfo.style.display = 'block';
            selectedLatLng.textContent = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
        }
        
        this.updateDistanceCircle();
    }

    updateDistanceCircle() {
        if (this.distanceCircle) {
            this.map.removeLayer(this.distanceCircle);
        }
        
        if (this.currentFilters.userLat && this.currentFilters.userLng) {
            this.distanceCircle = L.circle([this.currentFilters.userLat, this.currentFilters.userLng], {
                color: '#007bff',
                fillColor: '#007bff',
                fillOpacity: 0.1,
                radius: this.currentFilters.distanceRadius * 1000 // Convert km to meters
            }).addTo(this.map);
        }
    }

    confirmLocation() {
        if (this.currentFilters.userLat && this.currentFilters.userLng) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('mapModal'));
            modal.hide();
            this.applyFilters();
            this.showSuccess('Ubicación seleccionada. Los eventos se han filtrado por distancia.');
        } else {
            this.showError('Por favor, selecciona una ubicación en el mapa.');
        }
    }

    downloadCalendar() {
        if (this.selectedEvents.size === 0) {
            this.showError('No hay eventos seleccionados para descargar.');
            return;
        }
        
        // Get selected events with edits applied
        const selectedEventsList = this.getSelectedEventsWithEdits();
        
        const icsContent = this.generateICSContent(selectedEventsList);
        this.downloadFile(icsContent, 'eventos-culturales.ics', 'text/calendar');
        
        this.showSuccess(`Calendario descargado con ${selectedEventsList.length} eventos`);
    }

    downloadPDF() {
        if (this.selectedEvents.size === 0) {
            this.showError('No hay eventos seleccionados para descargar.');
            return;
        }
        
        // Get selected events with edits applied
        const selectedEventsList = this.getSelectedEventsWithEdits();
        
        this.showLoading(true);
        this.generatePDFCalendar(selectedEventsList)
            .then(() => {
                this.showSuccess(`PDF generado con ${selectedEventsList.length} eventos`);
            })
            .catch(error => {
                console.error('Error generating PDF:', error);
                this.showError('Error al generar el PDF. Intenta nuevamente.');
            })
            .finally(() => {
                this.showLoading(false);
            });
    }

    getSelectedEventsWithEdits() {
        const selectedEventsList = [];
        this.selectedEvents.forEach(key => {
            // Find the original event using the new key format
            const originalEvent = this.events.find(e => `${e.title}-${e.start_datetime}-${e.placeName}` === key);
            if (originalEvent) {
                // Check if there's an edited version
                const editedEvent = this.getEditedEvent(key);
                if (editedEvent) {
                    // Merge edited fields with original event, preserving icon
                    const mergedEvent = {
                        ...originalEvent,
                        ...editedEvent,
                        icon: originalEvent.icon // Preserve the original icon
                    };
                    selectedEventsList.push(mergedEvent);
                } else {
                    selectedEventsList.push(originalEvent);
                }
            }
        });
        return selectedEventsList;
    }

    async generatePDFCalendar(events) {
        if (!events || events.length === 0) {
            this.showError('No hay eventos para generar el calendario.');
            return;
        }

        const templateKey = document.getElementById('pdf-template').value;
        const template = this.templates[templateKey] || this.templates.default;
        
        // Group events by month
        const eventsByMonth = this.groupEventsByMonth(events);
        
        // Create PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait', // Always portrait
            unit: 'mm',
            format: 'a4'
        });
        
        let currentPage = 1;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (2 * margin);
        const contentHeight = pageHeight - (2 * margin);
        
        // Add title page
        doc.setFontSize(24);
        doc.setTextColor(50, 50, 50);
        doc.text('Mi Calendario de Eventos', pageWidth / 2, 40, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generado el ${new Date().toLocaleDateString('es-AR')}`, pageWidth / 2, 55, { align: 'center' });
        doc.text(`Total de eventos: ${events.length}`, pageWidth / 2, 65, { align: 'center' });
        
        // Add events list
        let yPosition = 90;
        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text('Lista de Eventos:', margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        events.forEach((event, index) => {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                currentPage++;
                yPosition = margin + 20;
            }
            
            const date = this.parseDateTimeString(event.start_datetime);
            const formattedDate = date.toLocaleDateString('es-AR', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const eventText = `${formattedDate} - ${event.title} (${event.place})`;
            
            // Check if text fits on current line
            const textWidth = doc.getTextWidth(eventText);
            if (textWidth > contentWidth) {
                // Split text into multiple lines
                const words = eventText.split(' ');
                let line = '';
                let lineY = yPosition;
                
                words.forEach(word => {
                    const testLine = line + (line ? ' ' : '') + word;
                    if (doc.getTextWidth(testLine) <= contentWidth) {
                        line = testLine;
                    } else {
                        if (line) {
                            doc.text(line, margin, lineY);
                            lineY += 5;
                            line = word;
                        } else {
                            // Word is too long, break it
                            doc.text(word, margin, lineY);
                            lineY += 5;
                        }
                    }
                });
                
                if (line) {
                    doc.text(line, margin, lineY);
                    yPosition = lineY + 8;
                }
            } else {
                doc.text(eventText, margin, yPosition);
                yPosition += 8;
            }
        });
        
        // Add calendar pages
        for (const [monthKey, monthEvents] of Object.entries(eventsByMonth)) {
            doc.addPage();
            currentPage++;
            
            const monthCalendar = this.generateMonthCalendar(monthKey, monthEvents, templateKey);
            
            // Convert HTML to canvas and add to PDF
            const canvas = await html2canvas(monthCalendar, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Check if image fits on page
            if (imgHeight > contentHeight) {
                // Scale down to fit
                const scale = contentHeight / imgHeight;
                const finalWidth = imgWidth * scale;
                const finalHeight = imgHeight * scale;
                const xOffset = (pageWidth - finalWidth) / 2;
                
                doc.addImage(imgData, 'PNG', xOffset, margin, finalWidth, finalHeight);
            } else {
                const xOffset = (pageWidth - imgWidth) / 2;
                doc.addImage(imgData, 'PNG', xOffset, margin, imgWidth, imgHeight);
            }
        }
        
        // Save the PDF
        const filename = `calendario_eventos_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        this.showSuccess('Calendario PDF generado correctamente.');
    }

    groupEventsByMonth(events) {
        const grouped = {};
        
        events.forEach(event => {
            const date = this.parseDateTimeString(event.start_datetime);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(event);
        });
        
        return grouped;
    }

    generateMonthCalendar(monthKey, events, template = 'default') {
        const [year, month] = monthKey.split('-');
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const monthName = monthNames[parseInt(month) - 1];
        const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
        const lastDay = new Date(parseInt(year), parseInt(month), 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
        
        // Get template styles
        const style = this.templates[template]?.styles || this.templates.default.styles;
        
        let calendarHTML = `
            <div class="month-calendar" style="page-break-after: always; margin-bottom: 20px;">
                <h2 style="${style.headerStyle}">
                    ${monthName} ${year}
                </h2>
                <table style="${style.tableStyle}">
                    <thead>
                        <tr>
                            <th style="${style.thStyle}">Dom</th>
                            <th style="${style.thStyle}">Lun</th>
                            <th style="${style.thStyle}">Mar</th>
                            <th style="${style.thStyle}">Mié</th>
                            <th style="${style.thStyle}">Jue</th>
                            <th style="${style.thStyle}">Vie</th>
                            <th style="${style.thStyle}">Sáb</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let dayCount = 1;
        const weeks = Math.ceil((daysInMonth + startDayOfWeek) / 7);
        
        for (let week = 0; week < weeks; week++) {
            calendarHTML += '<tr>';
            
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
                if ((week === 0 && dayOfWeek < startDayOfWeek) || dayCount > daysInMonth) {
                    calendarHTML += `<td style="${style.tdStyle} background-color: #f8f9fa;"></td>`;
                } else {
                    const dayEvents = events.filter(event => {
                        const eventDate = this.parseDateTimeString(event.start_datetime);
                        return eventDate.getDate() === dayCount;
                    });
                    
                    calendarHTML += `
                        <td style="${style.tdStyle}">
                            <div style="${style.dayNumberStyle}">${dayCount}</div>
                    `;
                    
                    dayEvents.forEach(event => {
                        // Format event text with smart line breaks and include time
                        const eventDate = this.parseDateTimeString(event.start_datetime);
                        const timeString = eventDate.toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        const eventTextWithTime = `${timeString} - ${event.title}`;
                        const formattedTitle = this.formatEventText(eventTextWithTime, 18);
                        const fontSize = this.calculateFontSize(eventTextWithTime, 8);
                        
                        // Create dynamic event style with calculated font size
                        const dynamicEventStyle = style.eventStyle.replace(
                            /font-size:\s*\d+px/, 
                            `font-size: ${fontSize}px`
                        );
                        
                        calendarHTML += `
                            <div style="${dynamicEventStyle}">
                                ${formattedTitle.replace(/\n/g, '<br>')}
                            </div>
                        `;
                    });
                    
                    calendarHTML += '</td>';
                    dayCount++;
                }
            }
            
            calendarHTML += '</tr>';
        }
        
        calendarHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        return calendarHTML;
    }

    generateICSContent(events) {
        let ics = 'BEGIN:VCALENDAR\r\n';
        ics += 'VERSION:2.0\r\n';
        ics += 'PRODID:-//Cultural Events BA//ES\r\n';
        ics += 'CALSCALE:GREGORIAN\r\n';
        ics += 'METHOD:PUBLISH\r\n';
        
        events.forEach(event => {
            const startDate = this.parseDateTimeString(event.start_datetime);
            const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
            
            // Build description with URL if available
            let description = `Evento cultural en ${event.placeName}. Tipo: ${this.getTypeDisplayName(event.type)}. ${event.price ? `Precio: $${event.price}` : 'Gratis'}`;
            if (event.url) {
                description += `\n\nMás información: ${event.url}`;
            }
            
            ics += 'BEGIN:VEVENT\r\n';
            ics += `UID:${this.generateUID()}\r\n`;
            ics += `DTSTART:${this.formatDateForICS(startDate)}\r\n`;
            ics += `DTEND:${this.formatDateForICS(endDate)}\r\n`;
            ics += `SUMMARY:${this.escapeICS(event.title)}\r\n`;
            ics += `DESCRIPTION:${this.escapeICS(description)}\r\n`;
            ics += `LOCATION:${this.escapeICS(event.placeName)}\r\n`;
            if (event.url) {
                ics += `URL:${event.url}\r\n`;
            }
            ics += 'END:VEVENT\r\n';
        });
        
        ics += 'END:VCALENDAR\r\n';
        return ics;
    }

    formatDateForICS(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    generateUID() {
        return 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    escapeICS(text) {
        return text.replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    showLoading(show) {
        const loadingDiv = document.getElementById('loading');
        const eventsGrid = document.getElementById('events-grid');
        
        if (show) {
            loadingDiv.style.display = 'flex';
            eventsGrid.style.display = 'none';
        } else {
            loadingDiv.style.display = 'none';
            eventsGrid.style.display = 'flex';
        }
    }

    showSuccess(message) {
        const alert = document.getElementById('success-alert');
        const messageElement = document.getElementById('success-message');
        messageElement.textContent = message;
        alert.style.display = 'block';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    }

    showError(message) {
        // Create a temporary error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
        alertDiv.style.zIndex = '1050';
        alertDiv.style.maxWidth = '400px';
        alertDiv.innerHTML = `
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${this.escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Error reporting functions
    submitErrorReport() {
        const errorType = document.getElementById('error-type').value;
        const errorDescription = document.getElementById('error-description').value;
        const userEmail = document.getElementById('user-email').value;
        const eventTitle = document.getElementById('error-event-title').value;
        
        if (!errorType || !errorDescription.trim()) {
            this.showError('Por favor, completa todos los campos obligatorios.');
            return;
        }
        
        if (userEmail && !this.isValidEmail(userEmail)) {
            this.showError('Por favor, ingresa un email válido.');
            return;
        }
        
        const modal = document.getElementById('reportErrorModal');
        const eventKey = modal.dataset.eventKey;
        const event = this.events.find(e => `${e.title}-${e.start_datetime}-${e.place}` === eventKey);
        
        if (!event) {
            this.showError('No se pudo encontrar el evento.');
            return;
        }
        
        const errorReport = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            eventTitle: event.title,
            eventDateTime: event.start_datetime,
            eventPlace: event.place,
            errorType: errorType,
            description: errorDescription.trim(),
            userEmail: userEmail.trim() || null,
            status: 'pending'
        };
        
        this.saveErrorReport(errorReport);
        
        // Close modal
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        
        // Clear form
        document.getElementById('error-type').value = '';
        document.getElementById('error-description').value = '';
        document.getElementById('user-email').value = '';
        
        this.showSuccess('Reporte enviado correctamente. Gracias por ayudarnos a mejorar.');
    }

    saveErrorReport(errorReport) {
        // Get existing reports from localStorage
        const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
        
        // Add new report
        existingReports.push(errorReport);
        
        // Save back to localStorage
        localStorage.setItem('errorReports', JSON.stringify(existingReports));
        
        // Log to console for development purposes
        console.log('Error report saved:', errorReport);
        console.log('Total error reports:', existingReports.length);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to get all error reports (for admin purposes)
    getAllErrorReports() {
        return JSON.parse(localStorage.getItem('errorReports') || '[]');
    }

    // Function to clear error reports (for admin purposes)
    clearErrorReports() {
        localStorage.removeItem('errorReports');
        console.log('All error reports cleared');
    }

    // Place search functionality
    filterPlaceCheckboxes(searchTerm) {
        const placeCheckboxes = document.querySelectorAll('.place-checkbox');
        const searchTermLower = searchTerm.toLowerCase();
        
        placeCheckboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling;
            const placeName = checkbox.value.toLowerCase();
            
            if (searchTerm === '' || placeName.includes(searchTermLower)) {
                // Show the checkbox and label
                checkbox.style.display = '';
                label.style.display = '';
                checkbox.parentElement.style.display = '';
            } else {
                // Hide the checkbox and label
                checkbox.style.display = 'none';
                label.style.display = 'none';
                checkbox.parentElement.style.display = 'none';
            }
        });
        
        // Update the "select all" checkbox state
        this.updateSelectAllState(
            document.getElementById('place-all'),
            document.querySelectorAll('.place-checkbox:not([style*="display: none"])')
        );
    }

    // Type search functionality
    filterTypeCheckboxes(searchTerm) {
        const typeCheckboxes = document.querySelectorAll('.type-checkbox');
        const searchTermLower = searchTerm.toLowerCase();
        
        typeCheckboxes.forEach(checkbox => {
            const label = checkbox.nextElementSibling;
            const typeName = checkbox.value.toLowerCase();
            
            if (searchTerm === '' || typeName.includes(searchTermLower)) {
                // Show the checkbox and label
                checkbox.style.display = '';
                label.style.display = '';
                checkbox.parentElement.style.display = '';
            } else {
                // Hide the checkbox and label
                checkbox.style.display = 'none';
                label.style.display = 'none';
                checkbox.parentElement.style.display = 'none';
            }
        });
        
        // Update the "select all" checkbox state
        this.updateSelectAllState(
            document.getElementById('type-all'),
            document.querySelectorAll('.type-checkbox:not([style*="display: none"])')
        );
    }

    // Event editing functions
    editEvent(eventKey) {
        // Find the original event
        const originalEvent = this.events.find(e => (e.title + e.start_datetime) === eventKey);
        if (!originalEvent) return;
        
        // Get the edited version if it exists
        const editedEvent = this.getEditedEvent(eventKey);
        const eventToEdit = editedEvent || originalEvent;
        
        // Parse the date and time
        const date = this.parseDateTimeString(eventToEdit.start_datetime);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().slice(0, 5);
        
        // Populate the form
        document.getElementById('edit-event-title').value = eventToEdit.title;
        document.getElementById('edit-event-date').value = dateStr;
        document.getElementById('edit-event-time').value = timeStr;
        document.getElementById('edit-event-place').value = eventToEdit.placeName;
        document.getElementById('edit-event-type').value = eventToEdit.type;
        document.getElementById('edit-event-price').value = eventToEdit.price || '';
        document.getElementById('edit-event-url').value = eventToEdit.url || '';
        
        // Store the event key for saving
        this.currentlyEditingEventKey = eventKey;
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('editEventModal'));
        modal.show();
    }

    saveEventChanges() {
        const form = document.getElementById('edit-event-form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Get form values
        const title = document.getElementById('edit-event-title').value.trim();
        const date = document.getElementById('edit-event-date').value;
        const time = document.getElementById('edit-event-time').value;
        const place = document.getElementById('edit-event-place').value.trim();
        const type = document.getElementById('edit-event-type').value;
        const price = document.getElementById('edit-event-price').value;
        const url = document.getElementById('edit-event-url').value.trim();
        
        // Create the edited event object
        const editedEvent = {
            title: title,
            start_datetime: `${date}T${time}:00`,
            placeName: place,
            type: type,
            price: price ? parseInt(price) : null,
            url: url || null
        };
        
        // Save the edited event
        this.saveEditedEvent(this.currentlyEditingEventKey, editedEvent);
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editEventModal'));
        modal.hide();
        
        // Refresh the display
        this.renderSelectedEvents();
        
        this.showSuccess('Evento editado correctamente');
    }

    saveEditedEvent(eventKey, editedEvent) {
        let editedEvents = JSON.parse(localStorage.getItem('editedEvents') || '{}');
        editedEvents[eventKey] = editedEvent;
        localStorage.setItem('editedEvents', JSON.stringify(editedEvents));
    }

    getEditedEvent(eventKey) {
        const editedEvents = JSON.parse(localStorage.getItem('editedEvents') || '{}');
        return editedEvents[eventKey] || null;
    }

    // Template selector change
    updateTemplateDescription(selectedTemplate) {
        const descElement = document.getElementById('template-desc-text');
        if (this.templates[selectedTemplate]) {
            descElement.textContent = this.templates[selectedTemplate].description;
        } else {
            descElement.textContent = 'Descripción no disponible';
        }
    }

    // Show calendar preview modal
    showCalendarPreview() {
        // Populate preview template selector
        this.populatePreviewTemplateSelector();
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('calendarPreviewModal'));
        modal.show();
        
        // Generate initial preview
        this.updateCalendarPreview();
    }

    // Populate preview template selector
    populatePreviewTemplateSelector() {
        const templateSelect = document.getElementById('preview-template');
        if (!templateSelect) return;

        templateSelect.innerHTML = '';
        
        Object.entries(this.templates).forEach(([key, template]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = template.name;
            templateSelect.appendChild(option);
        });
    }

    // Update preview template description
    updatePreviewTemplateDescription(selectedTemplate) {
        const descElement = document.getElementById('preview-template-desc');
        if (this.templates[selectedTemplate]) {
            descElement.textContent = this.templates[selectedTemplate].description;
        } else {
            descElement.textContent = 'Descripción no disponible';
        }
    }

    // Update calendar preview
    updateCalendarPreview() {
        const selectedTemplate = document.getElementById('preview-template').value;
        const showEvents = document.getElementById('preview-events').checked;
        
        // Get selected events or create sample events
        let eventsToShow = [];
        if (showEvents && this.selectedEvents.size > 0) {
            eventsToShow = this.getSelectedEventsWithEdits();
        } else if (showEvents) {
            eventsToShow = this.createSampleEvents();
        }
        
        // Generate preview HTML
        const previewHTML = this.generatePreviewHTML(selectedTemplate, eventsToShow);
        
        // Update preview container
        const container = document.getElementById('calendar-preview-container');
        if (container) {
            container.innerHTML = previewHTML;
        }
    }

    // Create sample events for preview
    createSampleEvents() {
        const currentDate = new Date();
        const sampleEvents = [
            {
                title: 'Concierto de Jazz',
                start_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15, 20, 0).toISOString(),
                placeName: 'Teatro Colón',
                type: 'music',
                price: 1500
            },
            {
                title: 'Exposición de Arte Contemporáneo',
                start_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18, 19, 0).toISOString(),
                placeName: 'MALBA',
                type: 'art',
                price: 800
            },
            {
                title: 'Obra de Teatro: Hamlet',
                start_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22, 21, 0).toISOString(),
                placeName: 'Teatro San Martín',
                type: 'theater',
                price: 1200
            },
            {
                title: 'Festival de Cine Independiente',
                start_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25, 18, 30).toISOString(),
                placeName: 'Cine Gaumont',
                type: 'cinema',
                price: 600
            },
            {
                title: 'Taller de Danza Contemporánea',
                start_datetime: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28, 16, 0).toISOString(),
                placeName: 'Centro Cultural Recoleta',
                type: 'dance',
                price: 400
            }
        ];
        
        return sampleEvents;
    }

    // Generate preview HTML
    generatePreviewHTML(template, events) {
        // Group events by month
        const eventsByMonth = this.groupEventsByMonth(events);
        
        let previewHTML = '';
        
        for (const [monthKey, monthEvents] of Object.entries(eventsByMonth)) {
            const monthHTML = this.generateMonthCalendar(monthKey, monthEvents, template);
            previewHTML += monthHTML;
        }
        
        return previewHTML;
    }

    // Download PDF from preview
    downloadPDFFromPreview() {
        const selectedTemplate = document.getElementById('preview-template').value;
        const showEvents = document.getElementById('preview-events').checked;
        
        // Get events to download
        let eventsToDownload = [];
        if (showEvents && this.selectedEvents.size > 0) {
            eventsToDownload = this.getSelectedEventsWithEdits();
        } else if (showEvents) {
            eventsToDownload = this.createSampleEvents();
        }
        
        // Set the template in the main selector
        document.getElementById('pdf-template').value = selectedTemplate;
        
        // Generate and download PDF
        this.generatePDFCalendar(eventsToDownload);
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('calendarPreviewModal'));
        if (modal) {
            modal.hide();
        }
    }
}

// Initialize the app when the DOM is loaded
window.app = new CulturalEventsApp();