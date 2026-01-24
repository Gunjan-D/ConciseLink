// Demo data and functionality for ShortLink website
class ShortLinkDemo {
    constructor() {
        this.baseUrl = 'https://short.ly';
        this.demoUrls = new Map();
        this.analytics = new Map();
        this.urlMappings = new Map(); // Store short code to original URL mappings
        this.initializeDemo();
        this.bindEvents();
        this.startLiveDemo();
        this.addUniversalShortUrlHandler();
    }

    initializeDemo() {
        // Initialize with some demo data
        const demoData = [
            {
                shortCode: 'demo123',
                originalUrl: 'https://www.example.com/very-long-article-about-technology',
                title: 'Tech Article Demo',
                clicks: 1234,
                uniqueVisitors: 856,
                createdAt: new Date('2024-01-15'),
                countries: { 'US': 67, 'GB': 23, 'DE': 18, 'CA': 12, 'AU': 8 },
                referrers: { 'direct': 45, 'twitter.com': 34, 'google.com': 28, 'facebook.com': 18 },
                devices: { 'mobile': 89, 'desktop': 52, 'tablet': 15 }
            },
            {
                shortCode: 'github-fastapi',
                originalUrl: 'https://github.com/fastapi/fastapi',
                title: 'FastAPI GitHub Repository',
                clicks: 892,
                uniqueVisitors: 654,
                createdAt: new Date('2024-01-20'),
                countries: { 'US': 45, 'IN': 28, 'DE': 15, 'GB': 12, 'BR': 10 },
                referrers: { 'github.com': 67, 'google.com': 23, 'direct': 18 },
                devices: { 'desktop': 78, 'mobile': 34, 'tablet': 8 }
            }
        ];

        demoData.forEach(item => {
            this.demoUrls.set(item.shortCode, item);
            this.analytics.set(item.shortCode, item);
            // Also add to URL mappings so demo examples work
            this.urlMappings.set(item.shortCode, item.originalUrl);
        });
        
        // Load saved mappings from localStorage
        const storedMappings = JSON.parse(localStorage.getItem('shortlinkMappings') || '{}');
        Object.entries(storedMappings).forEach(([shortCode, url]) => {
            this.urlMappings.set(shortCode, url);
        });
    }

    bindEvents() {
        // URL Shortener form
        const shortenBtn = document.getElementById('shortenBtn');
        const originalUrl = document.getElementById('originalUrl');
        const toggleAdvanced = document.getElementById('toggleAdvanced');
        const advancedOptions = document.getElementById('advancedOptions');
        const copyBtn = document.getElementById('copyBtn');

        if (shortenBtn) {
            shortenBtn.addEventListener('click', () => this.shortenUrl());
        }

        if (originalUrl) {
            originalUrl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.shortenUrl();
                }
            });
        }

        if (toggleAdvanced) {
            toggleAdvanced.addEventListener('click', () => {
                const isVisible = advancedOptions.style.display !== 'none';
                advancedOptions.style.display = isVisible ? 'none' : 'block';
                toggleAdvanced.innerHTML = isVisible 
                    ? '<i class="fas fa-cog"></i> Advanced Options'
                    : '<i class="fas fa-times"></i> Hide Options';
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard());
        }

        // Example buttons
        const exampleBtns = document.querySelectorAll('.example-btn');
        exampleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                document.getElementById('originalUrl').value = url;
                this.shortenUrl();
            });
        });

        // API tabs
        const apiTabs = document.querySelectorAll('.api-tab');
        apiTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchApiTab(tab));
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Result action buttons
        const viewAnalytics = document.getElementById('viewAnalytics');
        const generateQR = document.getElementById('generateQR');
        const editLink = document.getElementById('editLink');

        if (viewAnalytics) {
            viewAnalytics.addEventListener('click', () => this.showAnalytics());
        }

        if (generateQR) {
            generateQR.addEventListener('click', () => this.generateQRCode());
        }

        if (editLink) {
            editLink.addEventListener('click', () => this.editLink());
        }
    }

    async shortenUrl() {
        const originalUrlInput = document.getElementById('originalUrl');
        const shortenBtn = document.getElementById('shortenBtn');
        const resultsSection = document.getElementById('resultsSection');
        const resultOriginalUrl = document.getElementById('resultOriginalUrl');
        const resultShortUrl = document.getElementById('resultShortUrl');

        if (!originalUrlInput.value.trim()) {
            this.showToast('Please enter a URL', 'error');
            return;
        }

        // Validate URL
        try {
            new URL(originalUrlInput.value);
        } catch {
            this.showToast('Please enter a valid URL', 'error');
            return;
        }

        // Show loading state
        shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        shortenBtn.disabled = true;

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate short code
        const customCode = document.getElementById('customCode').value.trim();
        const shortCode = customCode || this.generateShortCode();
        const shortUrl = `${this.baseUrl}/${shortCode}`;

        // Store in demo data
        const urlData = {
            shortCode,
            originalUrl: originalUrlInput.value,
            title: document.getElementById('linkTitle').value || 'Untitled',
            shortUrl,
            createdAt: new Date(),
            clicks: 0,
            uniqueVisitors: 0,
            countries: {},
            referrers: { 'direct': 0 },
            devices: { 'mobile': 0, 'desktop': 0, 'tablet': 0 }
        };

        this.demoUrls.set(shortCode, urlData);
        this.analytics.set(shortCode, urlData);
        
        // CRITICAL: Store the mapping for redirect functionality
        this.urlMappings.set(shortCode, originalUrlInput.value);
        
        // Store in localStorage for persistence
        const storedMappings = JSON.parse(localStorage.getItem('shortlinkMappings') || '{}');
        storedMappings[shortCode] = originalUrlInput.value;
        localStorage.setItem('shortlinkMappings', JSON.stringify(storedMappings));

        // Update UI
        resultOriginalUrl.textContent = originalUrlInput.value;
        resultShortUrl.textContent = shortUrl;
        
        // Make the short URL clickable
        const shortUrlElement = document.getElementById('resultShortUrl');
        shortUrlElement.style.cursor = 'pointer';
        shortUrlElement.style.textDecoration = 'underline';
        shortUrlElement.style.color = '#0066ff';
        shortUrlElement.style.fontWeight = '600';
        
        // Add click handler for immediate functionality
        shortUrlElement.onclick = (e) => {
            e.preventDefault();
            this.handleShortUrlClick(shortCode);
        };
        
        resultsSection.style.display = 'block';

        // Reset button
        shortenBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Shorten URL';
        shortenBtn.disabled = false;

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        this.showToast('URL shortened successfully!', 'success');
    }

    generateShortCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async copyToClipboard() {
        const resultShortUrl = document.getElementById('resultShortUrl');
        const url = resultShortUrl.textContent;

        try {
            await navigator.clipboard.writeText(url);
            this.showToast('URL copied to clipboard!', 'success');
            
            // Visual feedback
            const copyBtn = document.getElementById('copyBtn');
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.background = 'rgba(40, 167, 69, 0.2)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.background = '';
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.showToast('URL copied to clipboard!', 'success');
        }
    }

    switchApiTab(clickedTab) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.api-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.api-tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        clickedTab.classList.add('active');
        const tabId = clickedTab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    }

    showAnalytics() {
        const analyticsSection = document.getElementById('analytics');
        analyticsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update with current URL data if available
        this.updateAnalyticsDemo();
        this.showToast('Analytics updated with your link data', 'success');
    }

    generateQRCode() {
        const resultShortUrl = document.getElementById('resultShortUrl');
        const url = resultShortUrl.textContent;
        
        // Simulate QR code generation
        this.showToast('QR Code would be generated for: ' + url, 'info');
        
        // In a real implementation, you would integrate with a QR code service
        // const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    }

    editLink() {
        // Scroll back to the form with current data
        const resultOriginalUrl = document.getElementById('resultOriginalUrl');
        const originalUrlInput = document.getElementById('originalUrl');
        
        originalUrlInput.value = resultOriginalUrl.textContent;
        originalUrlInput.focus();
        
        // Show advanced options
        const advancedOptions = document.getElementById('advancedOptions');
        const toggleAdvanced = document.getElementById('toggleAdvanced');
        advancedOptions.style.display = 'block';
        toggleAdvanced.innerHTML = '<i class="fas fa-times"></i> Hide Options';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showToast('Edit your link settings above', 'info');
    }

    updateAnalyticsDemo() {
        // Update analytics numbers with realistic increments
        const totalClicks = document.getElementById('totalClicks');
        const uniqueVisitors = document.getElementById('uniqueVisitors');
        
        if (totalClicks) {
            const currentClicks = parseInt(totalClicks.textContent.replace(',', ''));
            const newClicks = currentClicks + Math.floor(Math.random() * 10) + 1;
            totalClicks.textContent = newClicks.toLocaleString();
        }

        if (uniqueVisitors) {
            const currentVisitors = parseInt(uniqueVisitors.textContent.replace(',', ''));
            const newVisitors = currentVisitors + Math.floor(Math.random() * 5) + 1;
            uniqueVisitors.textContent = newVisitors.toLocaleString();
        }
    }

    startLiveDemo() {
        // Simulate live analytics updates
        setInterval(() => {
            const shouldUpdate = Math.random() < 0.3; // 30% chance every 5 seconds
            if (shouldUpdate) {
                this.updateAnalyticsDemo();
            }
        }, 5000);

        // Initialize chart if Chart.js is available
        this.initializeChart();
    }

    initializeChart() {
        const canvas = document.getElementById('clicksChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Simple chart without Chart.js dependency
        this.drawSimpleChart(ctx, canvas.width, canvas.height);
    }

    drawSimpleChart(ctx, width, height) {
        // Generate sample data for the last 7 days
        const data = [];
        for (let i = 0; i < 7; i++) {
            data.push(Math.floor(Math.random() * 100) + 20);
        }

        const maxValue = Math.max(...data);
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i * chartHeight / 5);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Draw chart line
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((value, index) => {
            const x = padding + (index * chartWidth / (data.length - 1));
            const y = height - padding - (value / maxValue * chartHeight);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#0066ff';
        data.forEach((value, index) => {
            const x = padding + (index * chartWidth / (data.length - 1));
            const y = height - padding - (value / maxValue * chartHeight);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach((day, index) => {
            const x = padding + (index * chartWidth / (days.length - 1));
            ctx.fillText(day, x, height - 10);
        });
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.querySelector('.toast-message');
        const toastIcon = document.querySelector('.toast-content i');

        // Set message
        toastMessage.textContent = message;

        // Set icon based on type
        toastIcon.className = type === 'success' ? 'fas fa-check-circle' :
                            type === 'error' ? 'fas fa-exclamation-circle' :
                            type === 'info' ? 'fas fa-info-circle' :
                            'fas fa-check-circle';

        // Set color based on type
        toast.style.background = type === 'success' ? '#28a745' :
                               type === 'error' ? '#dc3545' :
                               type === 'info' ? '#17a2b8' :
                               '#28a745';

        // Show toast
        toast.classList.add('show');

        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Utility function to format numbers
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Simulate real-time features
    simulateRealTimeFeatures() {
        // Simulate new clicks every few seconds
        setInterval(() => {
            if (Math.random() < 0.2) { // 20% chance
                this.addRandomClick();
            }
        }, 3000);
    }

    addRandomClick() {
        // Add a random click to demo data
        const demoKeys = Array.from(this.demoUrls.keys());
        const randomKey = demoKeys[Math.floor(Math.random() * demoKeys.length)];
        const urlData = this.demoUrls.get(randomKey);
        
        if (urlData) {
            urlData.clicks++;
            if (Math.random() < 0.7) { // 70% chance it's a unique visitor
                urlData.uniqueVisitors++;
            }
            
            // Update country data
            const countries = ['US', 'GB', 'DE', 'CA', 'AU', 'FR', 'JP', 'BR'];
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];
            urlData.countries[randomCountry] = (urlData.countries[randomCountry] || 0) + 1;
            
            // Update device data
            const devices = ['mobile', 'desktop', 'tablet'];
            const randomDevice = devices[Math.floor(Math.random() * devices.length)];
            urlData.devices[randomDevice]++;
        }
    }
    
    addUniversalShortUrlHandler() {
        // Handle clicks on any element that contains short URLs
        document.addEventListener('click', (e) => {
            const target = e.target;
            const text = target.textContent || '';
            
            // Check if it's a short URL pattern
            if (text.includes('short.ly/')) {
                const shortCode = text.split('short.ly/')[1].split(/\s/)[0]; // Handle trailing spaces
                if (shortCode && shortCode.length > 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleShortUrlClick(shortCode);
                }
            }
        }, true); // Use capture phase
    }
    
    handleShortUrlClick(shortCode) {
        console.log('Handling click for short code:', shortCode);
        
        // First try localStorage (most reliable for user URLs)
        const storedMappings = JSON.parse(localStorage.getItem('shortlinkMappings') || '{}');
        let originalUrl = storedMappings[shortCode];
        
        // Then try memory mappings
        if (!originalUrl) {
            originalUrl = this.urlMappings.get(shortCode);
        }
        
        // Finally, try demo examples
        if (!originalUrl) {
            const demoExamples = {
                'yt7x1k': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'gh4k9m': 'https://github.com/octocat/Hello-World',
                'py8n2q': 'https://docs.python.org/3/',
                'md3p7r': 'https://developer.mozilla.org/en-US/',
                'wp5s8t': 'https://wordpress.org/download/',
                'nf9l4v': 'https://www.netflix.com/browse'
            };
            originalUrl = demoExamples[shortCode];
        }
        
        if (originalUrl && originalUrl.trim() !== '') {
            console.log('Redirecting to:', originalUrl);
            this.showToast('🚀 Redirecting to original URL...', 'info');
            
            setTimeout(() => {
                this.showToast('✅ Opening: ' + originalUrl, 'success');
                window.open(originalUrl, '_blank');
                this.updateAnalyticsDemo();
            }, 500);
        } else {
            console.error('No URL found for short code:', shortCode);
            this.showToast('❌ Short URL not found. Please generate a new one.', 'error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const demo = new ShortLinkDemo();
    
    // Add smooth scroll behavior for the entire page
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add active states for navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Initialize pricing card interactions
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        const button = card.querySelector('button');
        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const plan = card.querySelector('h3').textContent;
                demo.showToast(`Selected ${plan} plan! Redirecting to signup...`, 'info');
                
                // In a real application, this would redirect to the signup page
                setTimeout(() => {
                    console.log(`Redirect to signup for ${plan} plan`);
                }, 1500);
            });
        }
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards for animation
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Make the demo more interactive
    demo.simulateRealTimeFeatures();
});