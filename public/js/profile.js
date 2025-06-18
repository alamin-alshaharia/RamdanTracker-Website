// Profile Management
class ProfileManager {
    constructor() {
        this.profileForm = document.getElementById('profileForm');
        this.changePasswordForm = document.getElementById('changePasswordForm');
        this.deleteAccountForm = document.getElementById('deleteAccountForm');
        this.avatarUpload = document.getElementById('avatarUpload');
        this.profileImage = document.getElementById('profileImage');
        this.userDisplayName = document.getElementById('userDisplayName');
        this.userEmail = document.getElementById('userEmail');
        this.completionProgress = document.getElementById('completionProgress');
        this.completionText = document.getElementById('completionText');
        this.activityList = document.getElementById('activityList');
        
        this.isLoading = false;
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupPreferences();
        this.loadActivityHistory();
    }

    setupPreferences() {
        // Load saved preferences
        const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {
            emailNotifications: true,
            darkMode: false
        };

        // Set initial states
        document.getElementById('emailNotifications').checked = preferences.emailNotifications;
        document.getElementById('darkMode').checked = preferences.darkMode;

        // Apply dark mode if enabled
        if (preferences.darkMode) {
            document.body.classList.add('dark-mode');
        }

        // Add event listeners
        document.getElementById('emailNotifications').addEventListener('change', (e) => {
            this.updatePreferences('emailNotifications', e.target.checked);
        });

        document.getElementById('darkMode').addEventListener('change', (e) => {
            this.updatePreferences('darkMode', e.target.checked);
            document.body.classList.toggle('dark-mode', e.target.checked);
        });
    }

    updatePreferences(key, value) {
        const preferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        preferences[key] = value;
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }

    async loadActivityHistory() {
        try {
            const user = authService.getCurrentUser();
            if (!user) return;

            const activities = await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection('activities')
                .orderBy('timestamp', 'desc')
                .limit(5)
                .get();

            this.activityList.innerHTML = '';
            activities.forEach(doc => {
                const activity = doc.data();
                this.addActivityItem(activity);
            });
        } catch (error) {
            console.error('Error loading activity history:', error);
        }
    }

    addActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${this.getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-details">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${this.formatTimestamp(activity.timestamp)}</div>
            </div>
        `;
        this.activityList.appendChild(item);
    }

    getActivityIcon(type) {
        const icons = {
            'profile_update': 'fa-user-edit',
            'password_change': 'fa-key',
            'photo_update': 'fa-camera',
            'login': 'fa-sign-in-alt',
            'logout': 'fa-sign-out-alt'
        };
        return icons[type] || 'fa-info-circle';
    }

    formatTimestamp(timestamp) {
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    calculateProfileCompletion() {
        const fields = [
            'displayName',
            'phone',
            'location',
            'bio',
            'facebook',
            'twitter',
            'instagram',
            'linkedin'
        ];

        let completed = 0;
        fields.forEach(field => {
            const value = document.getElementById(field)?.value;
            if (value && value.trim() !== '') completed++;
        });

        const percentage = (completed / fields.length) * 100;
        this.completionProgress.style.width = `${percentage}%`;
        this.completionText.textContent = `${Math.round(percentage)}% Complete`;
    }

    setupFormValidation() {
        // Password validation
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmNewPassword');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        newPassword.addEventListener('input', () => {
            const strength = this.validatePassword(newPassword);
            this.updatePasswordStrength(strength, strengthBar, strengthText);
        });
        
        confirmPassword.addEventListener('input', () => {
            this.validatePasswordConfirmation(newPassword, confirmPassword);
        });

        // Social media URL validation
        const socialInputs = document.querySelectorAll('.social-item input');
        socialInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateSocialUrl(input);
            });
        });
    }

    validateSocialUrl(input) {
        const url = input.value.trim();
        if (url === '') return true;

        try {
            new URL(url);
            input.setCustomValidity('');
            return true;
        } catch {
            input.setCustomValidity('Please enter a valid URL');
            return false;
        }
    }

    validatePassword(input) {
        const password = input.value;
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const strength = {
            score: 0,
            feedback: ''
        };

        if (hasMinLength) strength.score++;
        if (hasUpperCase) strength.score++;
        if (hasLowerCase) strength.score++;
        if (hasNumbers) strength.score++;
        if (hasSpecialChar) strength.score++;

        switch (strength.score) {
            case 0:
            case 1:
                strength.feedback = 'Very Weak';
                break;
            case 2:
                strength.feedback = 'Weak';
                break;
            case 3:
                strength.feedback = 'Medium';
                break;
            case 4:
                strength.feedback = 'Strong';
                break;
            case 5:
                strength.feedback = 'Very Strong';
                break;
        }

        input.setCustomValidity(strength.score >= 3 ? '' : 'Password is too weak');
        return strength;
    }

    updatePasswordStrength(strength, bar, text) {
        const colors = {
            0: '#ff4444',
            1: '#ff4444',
            2: '#ffbb33',
            3: '#ffeb3b',
            4: '#00C851',
            5: '#007E33'
        };

        bar.style.width = `${(strength.score / 5) * 100}%`;
        bar.style.backgroundColor = colors[strength.score];
        text.textContent = strength.feedback;
    }

    validatePasswordConfirmation(password, confirmation) {
        const isValid = password.value === confirmation.value;
        confirmation.setCustomValidity(isValid ? '' : 'Passwords do not match');
        return isValid;
    }

    async loadUserProfile() {
        try {
            this.setLoading(true);
            const user = authService.getCurrentUser();
            if (user) {
                this.userDisplayName.textContent = user.displayName || 'No Name Set';
                this.userEmail.textContent = user.email;
                
                // Load profile data from Firestore
                const userDoc = await firebase.firestore()
                    .collection('users')
                    .doc(user.uid)
                    .get();
                
                if (userDoc.exists) {
                    const data = userDoc.data();
                    document.getElementById('displayName').value = data.displayName || '';
                    document.getElementById('email').value = user.email;
                    document.getElementById('phone').value = data.phone || '';
                    document.getElementById('location').value = data.location || '';
                    document.getElementById('bio').value = data.bio || '';
                    document.getElementById('facebook').value = data.social?.facebook || '';
                    document.getElementById('twitter').value = data.social?.twitter || '';
                    document.getElementById('instagram').value = data.social?.instagram || '';
                    document.getElementById('linkedin').value = data.social?.linkedin || '';
                    
                    if (data.photoURL) {
                        this.profileImage.src = data.photoURL;
                    }
                }
            }
            this.calculateProfileCompletion();
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Failed to load profile data');
        } finally {
            this.setLoading(false);
        }
    }

    setupEventListeners() {
        // Profile form submission
        this.profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Avatar upload with preview
        this.avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    this.showError('Image size should be less than 5MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.profileImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
                
                this.uploadProfilePicture(file);
            }
        });

        // Change password
        this.changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validatePassword(document.getElementById('newPassword')).score >= 3 &&
                this.validatePasswordConfirmation(
                    document.getElementById('newPassword'),
                    document.getElementById('confirmNewPassword')
                )) {
                this.changePassword();
            }
        });

        // Delete account
        this.deleteAccountForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.confirmDeleteAccount();
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Change password button
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            document.getElementById('changePasswordModal').classList.add('active');
        });

        // Delete account button
        document.getElementById('deleteAccountBtn').addEventListener('click', () => {
            document.getElementById('deleteAccountModal').classList.add('active');
        });

        // Cancel delete button
        document.querySelector('.cancel-delete').addEventListener('click', () => {
            this.closeModals();
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Form field changes
        const formFields = this.profileForm.querySelectorAll('input, textarea');
        formFields.forEach(field => {
            field.addEventListener('input', () => {
                this.calculateProfileCompletion();
            });
        });
    }

    async updateProfile() {
        try {
            this.setLoading(true);
            const user = authService.getCurrentUser();
            if (!user) throw new Error('No user logged in');

            const displayName = document.getElementById('displayName').value;
            const phone = document.getElementById('phone').value;
            const location = document.getElementById('location').value;
            const bio = document.getElementById('bio').value;
            const social = {
                facebook: document.getElementById('facebook').value,
                twitter: document.getElementById('twitter').value,
                instagram: document.getElementById('instagram').value,
                linkedin: document.getElementById('linkedin').value
            };

            // Update profile in Firebase Auth
            await user.updateProfile({ displayName });

            // Update additional data in Firestore
            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .set({
                    displayName,
                    phone,
                    location,
                    bio,
                    social,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            // Add activity
            await this.addActivity('profile_update', 'Profile Updated');

            this.showSuccess('Profile updated successfully');
            this.loadUserProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Failed to update profile');
        } finally {
            this.setLoading(false);
        }
    }

    async addActivity(type, title) {
        try {
            const user = authService.getCurrentUser();
            if (!user) return;

            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection('activities')
                .add({
                    type,
                    title,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

            this.loadActivityHistory();
        } catch (error) {
            console.error('Error adding activity:', error);
        }
    }

    async uploadProfilePicture(file) {
        try {
            this.setLoading(true);
            const user = authService.getCurrentUser();
            if (!user) throw new Error('No user logged in');

            // Create a storage reference
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`profile_pictures/${user.uid}`);

            // Upload file with metadata
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    'uploadedBy': user.uid,
                    'uploadedAt': new Date().toISOString()
                }
            };

            // Upload file
            const uploadTask = await fileRef.put(file, metadata);

            // Get download URL
            const photoURL = await uploadTask.ref.getDownloadURL();

            // Update profile
            await user.updateProfile({ photoURL });
            this.profileImage.src = photoURL;

            // Update Firestore
            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .update({
                    photoURL,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            // Add activity
            await this.addActivity('photo_update', 'Profile Picture Updated');

            this.showSuccess('Profile picture updated successfully');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            this.showError('Failed to upload profile picture');
        } finally {
            this.setLoading(false);
        }
    }

    async changePassword() {
        try {
            this.setLoading(true);
            const user = authService.getCurrentUser();
            if (!user) throw new Error('No user logged in');

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;

            // Reauthenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await user.reauthenticateWithCredential(credential);

            // Update password
            await user.updatePassword(newPassword);

            // Add activity
            await this.addActivity('password_change', 'Password Changed');

            this.showSuccess('Password updated successfully');
            this.closeModals();
            this.changePasswordForm.reset();
        } catch (error) {
            console.error('Error changing password:', error);
            this.showError('Failed to change password. Please check your current password.');
        } finally {
            this.setLoading(false);
        }
    }

    async confirmDeleteAccount() {
        try {
            this.setLoading(true);
            const user = authService.getCurrentUser();
            if (!user) throw new Error('No user logged in');

            const password = document.getElementById('deletePassword').value;

            // Reauthenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                password
            );
            await user.reauthenticateWithCredential(credential);

            // Show final confirmation
            if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                await this.deleteAccount();
            }
        } catch (error) {
            console.error('Error confirming account deletion:', error);
            this.showError('Failed to verify password. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    async deleteAccount() {
        try {
            this.setLoading(true);
            const user = authService.getCurrentUser();
            if (!user) throw new Error('No user logged in');

            // Delete user data from Firestore
            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .delete();

            // Delete user profile picture from Storage
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`profile_pictures/${user.uid}`);
            await fileRef.delete();

            // Delete user account
            await user.delete();

            this.showSuccess('Account deleted successfully');
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            console.error('Error deleting account:', error);
            this.showError('Failed to delete account');
        } finally {
            this.setLoading(false);
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        // Reset forms
        this.changePasswordForm.reset();
        this.deleteAccountForm.reset();
    }

    setLoading(isLoading) {
        this.isLoading = isLoading;
        const buttons = document.querySelectorAll('button[type="submit"]');
        buttons.forEach(button => {
            button.disabled = isLoading;
            if (isLoading) {
                button.innerHTML = '<span class="loading-spinner"></span> Loading...';
            } else {
                button.innerHTML = button.getAttribute('data-original-text') || button.textContent;
            }
        });
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize Profile Manager
const profileManager = new ProfileManager(); 