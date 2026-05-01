// ============================================================
// login_process.js - Mobilization Church Authentication
// with Supabase Integration
// ============================================================

// ========== SUPABASE CONFIGURATION ==========
// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';     // ← CHANGE THIS
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';                   // ← CHANGE THIS

// Initialize Supabase client (loaded dynamically)
let supabaseClient = null;

// Define role-based redirect paths
const ROLE_REDIRECTS = {
    'member': 'member/index.html',
    'music': 'music/index.html',
    'program': 'program/index.html',
    'pastor': 'pastor/index.html',
    'officer': 'officer/index.html'
};

// Demo user database (fallback when Supabase is not configured or offline)
const DEMO_USERS = [
    { username: 'member', email: 'member@church.com', password: 'member123', role: 'member' },
    { username: 'music', email: 'music@church.com', password: 'music123', role: 'music' },
    { username: 'program', email: 'program@church.com', password: 'program123', role: 'program' },
    { username: 'pastor', email: 'pastor@church.com', password: 'pastor123', role: 'pastor' },
    { username: 'officer', email: 'officer@church.com', password: 'officer123', role: 'officer' },
    { username: 'john_member', email: 'john@gmail.com', password: 'member123', role: 'member' },
    { username: 'sarah_music', email: 'sarah@gmail.com', password: 'music123', role: 'music' }
];

// Check if Supabase is configured properly
function isSupabaseConfigured() {
    return SUPABASE_URL !== 'https://YOUR_PROJECT.supabase.co' && 
           SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY' &&
           SUPABASE_URL !== '' &&
           SUPABASE_ANON_KEY !== '';
}

// Load Supabase JS library dynamically
function loadSupabaseJS() {
    return new Promise((resolve, reject) => {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            resolve(supabase);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => {
            resolve(window.supabase);
        };
        script.onerror = () => {
            reject(new Error('Failed to load Supabase library'));
        };
        document.head.appendChild(script);
    });
}

// Initialize Supabase client
async function initSupabase() {
    if (!isSupabaseConfigured()) {
        console.warn("⚠️ Supabase not configured. Using demo mode.");
        return null;
    }
    
    try {
        const supabaseLib = await loadSupabaseJS();
        supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("✅ Supabase client initialized");
        return supabaseClient;
    } catch (error) {
        console.error("❌ Supabase initialization failed:", error);
        return null;
    }
}

// ========== AUTHENTICATION FUNCTIONS ==========

// Authenticate using Supabase Auth (email/password)
async function authenticateWithSupabase(email, password) {
    if (!supabaseClient) {
        await initSupabase();
    }
    
    if (!supabaseClient) {
        return { success: false, error: "Supabase not configured. Using demo mode." };
    }
    
    try {
        // Attempt sign in with email and password
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error("Supabase auth error:", error);
            return { success: false, error: error.message };
        }
        
        if (data && data.user) {
            // Fetch user role from 'church_users' table or user metadata
            let role = 'member'; // default role
            
            // Try to get role from user_metadata first
            if (data.user.user_metadata && data.user.user_metadata.role) {
                role = data.user.user_metadata.role;
            } else {
                // Query church_users table for role
                const { data: userData, error: userError } = await supabaseClient
                    .from('church_users')
                    .select('role')
                    .eq('email', data.user.email)
                    .single();
                
                if (!userError && userData && userData.role) {
                    role = userData.role;
                }
            }
            
            return { 
                success: true, 
                role: role.toLowerCase(),
                user: data.user,
                email: data.user.email
            };
        }
        
        return { success: false, error: "Authentication failed" };
        
    } catch (error) {
        console.error("Supabase login error:", error);
        return { success: false, error: error.message };
    }
}

// Authenticate using custom users table (username/password)
async function authenticateWithUsersTable(username, password) {
    if (!supabaseClient) {
        await initSupabase();
    }
    
    if (!supabaseClient) {
        return { success: false, error: "Supabase not configured" };
    }
    
    try {
        // Query church_users table by username
        const { data: userData, error: userError } = await supabaseClient
            .from('church_users')
            .select('*')
            .eq('username', username.toLowerCase())
            .single();
        
        if (userError || !userData) {
            // Try by email
            const { data: emailData, error: emailError } = await supabaseClient
                .from('church_users')
                .select('*')
                .eq('email', username.toLowerCase())
                .single();
            
            if (emailError || !emailData) {
                return { success: false, error: "User not found" };
            }
            
            // Verify password (assuming password is hashed, this is simplified)
            // In production, use bcrypt or Supabase Auth
            if (emailData.password === password) {
                return { 
                    success: true, 
                    role: emailData.role.toLowerCase(),
                    user: emailData,
                    email: emailData.email
                };
            }
            return { success: false, error: "Invalid password" };
        }
        
        // Verify password
        if (userData.password === password) {
            return { 
                success: true, 
                role: userData.role.toLowerCase(),
                user: userData,
                email: userData.email
            };
        }
        
        return { success: false, error: "Invalid password" };
        
    } catch (error) {
        console.error("Database query error:", error);
        return { success: false, error: error.message };
    }
}

// Demo mode login (fallback when Supabase not available)
function demoLogin(username, password) {
    console.log("Using demo login mode");
    const lowerInput = username.toLowerCase().trim();
    let foundUser = null;
    
    // Check by username or email
    foundUser = DEMO_USERS.find(user => 
        user.username.toLowerCase() === lowerInput || 
        user.email.toLowerCase() === lowerInput
    );
    
    // If not found, try role-based detection
    if (!foundUser) {
        let detectedRole = null;
        if (lowerInput.includes('member')) detectedRole = 'member';
        else if (lowerInput.includes('music')) detectedRole = 'music';
        else if (lowerInput.includes('program')) detectedRole = 'program';
        else if (lowerInput.includes('pastor')) detectedRole = 'pastor';
        else if (lowerInput.includes('officer')) detectedRole = 'officer';
        
        const validDemoPasswords = ['member123', 'music123', 'program123', 'pastor123', 'officer123', 'demo123', 'church123'];
        if (detectedRole && validDemoPasswords.includes(password)) {
            foundUser = { username: lowerInput, role: detectedRole };
        } else if (password === 'demo123' || password === 'church123') {
            foundUser = { username: lowerInput, role: 'member' };
        }
    }
    
    if (foundUser && (!foundUser.password || foundUser.password === password)) {
        return { success: true, role: foundUser.role };
    }
    
    return { success: false, error: "Demo mode: Invalid credentials. Try member/member123" };
}

// ========== MAIN LOGIN PROCESSOR ==========
async function processChurchLogin(username, password) {
    console.log("Processing login for:", username);
    
    // Validate inputs
    if (!username || !password) {
        if (typeof handleLoginResult === 'function') {
            handleLoginResult(false, null, null, "Please enter both username/email and password.");
        }
        return;
    }
    
    let result = null;
    const isEmail = username.includes('@');
    
    // Try Supabase if configured
    if (isSupabaseConfigured()) {
        try {
            await initSupabase();
            
            if (isEmail) {
                // Use Supabase Auth for email login
                result = await authenticateWithSupabase(username, password);
            } else {
                // Use users table for username login
                result = await authenticateWithUsersTable(username, password);
            }
            
            if (result && result.success) {
                // Successful Supabase login
                const role = result.role;
                const redirectUrl = ROLE_REDIRECTS[role] || 'member/index.html';
                
                // Store session data
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('userEmail', result.email || username);
                sessionStorage.setItem('authMethod', 'supabase');
                
                console.log(`✅ Supabase login successful! Role: ${role}`);
                
                if (typeof handleLoginResult === 'function') {
                    handleLoginResult(true, role, redirectUrl, null);
                }
                return;
            } else if (result && !result.success && !result.error.includes("not configured")) {
                // Supabase auth failed, show error
                if (typeof handleLoginResult === 'function') {
                    handleLoginResult(false, null, null, result.error);
                }
                return;
            }
        } catch (error) {
            console.error("Supabase login error:", error);
            // Fall through to demo mode
        }
    }
    
    // Fallback to demo mode
    console.log("Falling back to demo mode...");
    const demoResult = demoLogin(username, password);
    
    if (demoResult.success) {
        const role = demoResult.role;
        const redirectUrl = ROLE_REDIRECTS[role] || 'member/index.html';
        
        sessionStorage.setItem('userRole', role);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('authMethod', 'demo');
        
        console.log(`✅ Demo login successful! Role: ${role}`);
        
        if (typeof handleLoginResult === 'function') {
            handleLoginResult(true, role, redirectUrl, null);
        }
    } else {
        console.log("❌ Login failed");
        if (typeof handleLoginResult === 'function') {
            handleLoginResult(false, null, null, demoResult.error || "Invalid username/email or password.");
        }
    }
}

// Function to check if user is already logged in
function checkAuthStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const userRole = sessionStorage.getItem('userRole');
    const username = sessionStorage.getItem('username');
    
    if (isLoggedIn && userRole) {
        return { loggedIn: true, role: userRole, username: username };
    }
    return { loggedIn: false };
}

// Function to logout
function logout() {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('authMethod');
    
    // Also sign out from Supabase if available
    if (supabaseClient) {
        supabaseClient.auth.signOut();
    }
    
    window.location.href = '../login.html';
}

// Export for module compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        processChurchLogin, 
        ROLE_REDIRECTS, 
        checkAuthStatus, 
        logout,
        initSupabase
    };
}

// Auto-initialize Supabase when script loads
initSupabase();

console.log("✅ login_process.js loaded with Supabase support");
console.log(`📡 Supabase status: ${isSupabaseConfigured() ? 'CONFIGURED' : 'DEMO MODE (configure Supabase to enable)'}`);

// Display configuration instructions if not configured
if (!isSupabaseConfigured()) {
    console.log("%c📌 To connect Supabase:", "color: #f59e0b; font-size: 12px;");
    console.log("1. Go to app.supabase.com");
    console.log("2. Create a new project");
    console.log("3. Copy your Project URL and Anon Key");
    console.log("4. Replace SUPABASE_URL and SUPABASE_ANON_KEY in this file");
    console.log("5. Create a 'church_users' table with columns: id, username, email, password, role");
}
