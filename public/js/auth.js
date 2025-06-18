// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Authentication Service
class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateChanged = null;
        this.setupEventListeners();
    }

    // Initialize Firebase Auth
    async initialize() {
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyD4aCsU80EPvzv1T226yuKsxiJOBGFddBM",
            authDomain: "ramadan-planner-282f5.firebaseapp.com",
            projectId: "ramadan-planner-282f5",
            storageBucket: "ramadan-planner-282f5.firebasestorage.app",
            messagingSenderId: "636968392066",
            appId: "1:636968392066:web:b74cce3d85ae6f628e2b9b",
            measurementId: "G-FR4E0LBSKP"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        this.auth = getAuth(app);
        
        // Set up auth state listener
        onAuthStateChanged(this.auth, (user) => {
            this.currentUser = user;
            if (this.authStateChanged) {
                this.authStateChanged(user);
            }
            this.updateAuthUI(user);
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showAuthModal('login');
            });
        }

        // Register button
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.showAuthModal('register');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.signOut();
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('authModal');
            if (e.target === modal) {
                this.hideAuthModal();
            }
        });

        // Close modal button
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideAuthModal();
            });
        }
    }

    // Show auth modal with specified form
    async showAuthModal(formType) {
        const modal = document.getElementById('authModal');
        const content = document.getElementById('authContent');
        
        try {
            // Load the appropriate form
            const formPath = formType === 'login' ? 'components/auth/login-form.html' : 'components/auth/register-form.html';
            const response = await fetch(formPath);
            if (!response.ok) throw new Error('Failed to load form');
            
            const html = await response.text();
            content.innerHTML = html;
            modal.classList.add('active');

            // Setup form submission
            const form = document.getElementById(formType === 'login' ? 'loginForm' : 'registerForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (formType === 'login') {
                        this.handleLogin(form);
                    } else {
                        this.handleRegister(form);
                    }
                });
            }

            // Setup form links
            const loginLink = content.querySelector('.login-link');
            const registerLink = content.querySelector('.register-link');
            const forgotPasswordLink = content.querySelector('.forgot-password');

            if (loginLink) {
                loginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showAuthModal('login');
                });
            }

            if (registerLink) {
                registerLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showAuthModal('register');
                });
            }

            if (forgotPasswordLink) {
                forgotPasswordLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleForgotPassword();
                });
            }
        } catch (error) {
            console.error('Error loading auth form:', error);
            this.showError('Failed to load authentication form');
        }
    }

    // Hide auth modal
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        modal.classList.remove('active');
        document.getElementById('authContent').innerHTML = '';
    }

    // Handle login form submission
    async handleLogin(form) {
        try {
            const email = form.email.value;
            const password = form.password.value;
            await this.signIn(email, password);
            this.hideAuthModal();
            this.showSuccess('Successfully logged in!');
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Handle register form submission
    async handleRegister(form) {
        try {
            const email = form.email.value;
            const password = form.password.value;
            const confirmPassword = form.confirmPassword.value;
            const displayName = form.displayName.value;

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            await this.register(email, password, displayName);
            this.hideAuthModal();
            this.showSuccess('Account created successfully!');
        } catch (error) {
            this.showError(error.message);
        }
    }

    // Handle forgot password
    async handleForgotPassword() {
        const email = prompt('Please enter your email address:');
        if (email) {
            try {
                await this.resetPassword(email);
                this.showSuccess('Password reset email sent!');
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    // Show success message
    showSuccess(message) {
        // You can implement a toast or notification system here
        alert(message);
    }

    // Show error message
    showError(message) {
        // You can implement a toast or notification system here
        alert(message);
    }

    // Update UI based on auth state
    updateAuthUI(user) {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const profileBtn = document.getElementById('profileBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userName = document.getElementById('userName');

        if (user) {
            // User is signed in
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            profileBtn.style.display = 'block';
            logoutBtn.style.display = 'block';
            userName.textContent = user.displayName || user.email;
        } else {
            // User is signed out
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            profileBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }

    // Register new user
    async register(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            await updateProfile(userCredential.user, { displayName });
            return userCredential.user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Sign in user
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Sign out user
    async signOut() {
        try {
            await signOut(this.auth);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update user profile
    async updateProfile(displayName, photoURL) {
        try {
            const user = this.auth.currentUser;
            if (user) {
                await updateProfile(user, { displayName, photoURL });
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Handle auth errors
    handleError(error) {
        let message = 'An error occurred';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Email is already registered';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/operation-not-allowed':
                message = 'Operation not allowed';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak';
                break;
            case 'auth/user-disabled':
                message = 'User account has been disabled';
                break;
            case 'auth/user-not-found':
                message = 'User not found';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            default:
                message = error.message;
        }
        return new Error(message);
    }
}

// Create and export a single instance of AuthService
const authService = new AuthService();
export default authService;

window.authService = authService; 