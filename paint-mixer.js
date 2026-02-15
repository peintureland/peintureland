// paint-mixer.js - Interactive Paint Color Mixer

class PaintMixer {
    constructor() {
        this.colors = [
            { name: 'Blue', value: '#4facfe' },
            { name: 'Cyan', value: '#00f2fe' },
            { name: 'Pink', value: '#f093fb' },
            { name: 'Red', value: '#f5576c' },
            { name: 'Purple', value: '#667eea' },
            { name: 'Deep Purple', value: '#764ba2' }
        ];
        
        this.currentColor = '#4facfe';
        this.init();
    }
    
    init() {
        this.createMixerUI();
        this.bindEvents();
    }
    
    createMixerUI() {
        const mixerHTML = `
            <div class="paint-mixer-container" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 1000;
                max-width: 300px;
                animation: fadeInUp 0.5s ease;
            ">
                <h3 style="margin: 0 0 15px 0; color: #333;">🎨 Paint Mixer</h3>
                <div class="color-palette" style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
                    ${this.colors.map(color => `
                        <button class="color-btn" 
                                style="width: 40px; height: 40px; border-radius: 50%; background: ${color.value}; border: none; cursor: pointer; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.1);"
                                data-color="${color.value}"
                                title="${color.name}">
                        </button>
                    `).join('')}
                </div>
                <div class="mixer-result" style="
                    width: 100%;
                    height: 60px;
                    background: ${this.currentColor};
                    border-radius: 10px;
                    margin-bottom: 15px;
                    transition: background 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
                ">
                    ${this.currentColor}
                </div>
                <button class="apply-color-btn" style="
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                    transition: transform 0.3s ease;
                ">
                    Apply Color Theme
                </button>
                <button class="close-mixer" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                ">
                    ×
                </button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', mixerHTML);
    }
    
    bindEvents() {
        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.selectColor(color);
                
                // Animate button
                e.target.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    e.target.style.transform = 'scale(1)';
                }, 200);
            });
        });
        
        // Apply color theme
        document.querySelector('.apply-color-btn').addEventListener('click', () => {
            this.applyColorTheme();
            animationsManager.createConfetti();
            // Use window reference to ensure it exists
            if (window.animationsManager && window.animationsManager.showSuccessAnimation) {
                window.animationsManager.showSuccessAnimation('Color Theme Applied!');
            }
        });
        
        // Close mixer
        document.querySelector('.close-mixer').addEventListener('click', () => {
            document.querySelector('.paint-mixer-container').style.animation = 'fadeInUp 0.5s ease reverse forwards';
            setTimeout(() => {
                document.querySelector('.paint-mixer-container').remove();
            }, 500);
        });
    }
    
    selectColor(color) {
        this.currentColor = color;
        const resultDiv = document.querySelector('.mixer-result');
        resultDiv.style.background = color;
        resultDiv.textContent = color;
        
        // Animate color change
        resultDiv.style.transform = 'scale(1.1)';
        setTimeout(() => {
            resultDiv.style.transform = 'scale(1)';
        }, 200);
    }
    
    applyColorTheme() {
        // Update CSS variables
        document.documentElement.style.setProperty('--primary-color', this.currentColor);
        
        // Update gradient elements
        const gradientElements = document.querySelectorAll('.header, .btn-primary, .btn-checkout');
        gradientElements.forEach(el => {
            el.style.background = `linear-gradient(135deg, ${this.currentColor} 0%, ${this.lightenColor(this.currentColor, 20)} 100%)`;
        });
        
        // Animate all elements
        document.querySelectorAll('.brand-card, .product-card').forEach((card, index) => {
            card.style.transition = 'all 0.3s ease';
            card.style.boxShadow = `0 10px 30px ${this.currentColor}30`;
            
            setTimeout(() => {
                card.style.boxShadow = '';
            }, 1000 + (index * 100));
        });
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
}

// Initialize paint mixer
document.addEventListener('DOMContentLoaded', () => {
    // Optional: Uncomment to enable paint mixer
    // window.paintMixer = new PaintMixer();
});