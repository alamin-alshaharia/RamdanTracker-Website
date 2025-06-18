// Premium Features Handler
class PremiumFeatures {
    constructor() {
        this.isPremium = false;
        this.checkPremiumStatus();
    }

    async checkPremiumStatus() {
        try {
            const response = await fetch('/api/premium/status');
            const data = await response.json();
            this.isPremium = data.isPremium;
            this.updateUI();
        } catch (error) {
            console.error('Error checking premium status:', error);
            this.isPremium = false;
            this.updateUI();
        }
    }

    updateUI() {
        const premiumElements = document.querySelectorAll('.premium-feature');
        premiumElements.forEach(element => {
            if (this.isPremium) {
                element.classList.remove('premium-locked');
                element.classList.add('premium-unlocked');
            } else {
                element.classList.remove('premium-unlocked');
                element.classList.add('premium-locked');
            }
        });
    }

    async upgradeToPremium() {
        try {
            const response = await fetch('/api/premium/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                this.isPremium = true;
                this.updateUI();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error upgrading to premium:', error);
            return false;
        }
    }
}

// Initialize premium features
const premiumFeatures = new PremiumFeatures();

// Export for use in other files
export default premiumFeatures; 