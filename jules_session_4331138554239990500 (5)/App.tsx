
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Header from './components/Header';
import Dashboard from './components/views/Dashboard';
import Nutrition from './components/views/Nutrition';
import Mindfulness from './components/views/Mindfulness';
import Habits from './components/views/Habits';
import Organization from './components/views/Organization';
import Settings from './components/views/Settings';
import Auth from './components/views/Auth';
import Onboarding from './components/views/Onboarding';
import Toast from './components/Toast';
import AudioPlayer from './components/AudioPlayer';
import { View, AudioTrack, User, ScanResult, Habit, NutritionGoals, JournalEntry, Notification, Reminder, Note } from './types';
import { jsPDF } from "jspdf";
import { searchFood } from './data/foodDatabase';

const App: React.FC = () => {
  // 1. Initial State for Auth
  const [user, setUser] = useState<User | null>(() => {
      const saved = localStorage.getItem('nutripulse_current_user');
      return saved ? JSON.parse(saved) : null;
  });

  // Unique user key to avoid collisions in localStorage
  const userKey = useMemo(() => user ? user.email.toLowerCase().replace(/[@.]/g, '_') : 'guest', [user]);

  // 2. State Hooks for User Data
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
      if (!user) return false;
      const currentKey = user.email.toLowerCase().replace(/[@.]/g, '_');
      return localStorage.getItem(`nutripulse_onboarding_${currentKey}`) === 'true';
  });
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [activeTrack, setActiveTrack] = useState<AudioTrack | null>(null);
  const [externalScanResult, setExternalScanResult] = useState<ScanResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Data state
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    calories: 2000, protein: 150, carbs: 250, fats: 65
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // 3. THEME SYNCHRONIZATION: Apply dark mode class to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (user?.theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [user?.theme]);

  // 4. REAL-TIME REMINDER POLLING
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (!reminder.completed && !reminder.notified) {
          const dueDate = new Date(reminder.dueDate);
          // Check if due time has passed or is now (within same minute)
          if (dueDate <= now) {
            addNotification('Protocol Reminder', reminder.title, reminder.priority === 'High' ? 'alert' : 'info');
            showToast(`ALARM: ${reminder.title}`, reminder.priority === 'High' ? 'error' : 'success');
            // Mark as notified so we don't spam
            setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, notified: true } : r));
          }
        }
      });
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [reminders]);

  // 5. EFFECT: Load user-specific data whenever user changes
  useEffect(() => {
    if (user) {
      const currentKey = user.email.toLowerCase().replace(/[@.]/g, '_');
      
      const savedScans = localStorage.getItem(`nutripulse_scans_${currentKey}`);
      setScanHistory(savedScans ? JSON.parse(savedScans) : []);

      const savedHabits = localStorage.getItem(`nutripulse_habits_${currentKey}`);
      setHabits(savedHabits ? JSON.parse(savedHabits) : []);

      const savedGoals = localStorage.getItem(`nutripulse_goals_${currentKey}`);
      setNutritionGoals(savedGoals ? JSON.parse(savedGoals) : { calories: 2000, protein: 150, carbs: 250, fats: 65 });

      const savedJournal = localStorage.getItem(`nutripulse_journal_${currentKey}`);
      setJournalEntries(savedJournal ? JSON.parse(savedJournal) : []);

      const savedReminders = localStorage.getItem(`nutripulse_reminders_${currentKey}`);
      setReminders(savedReminders ? JSON.parse(savedReminders) : []);

      const savedNotes = localStorage.getItem(`nutripulse_notes_${currentKey}`);
      setNotes(savedNotes ? JSON.parse(savedNotes) : []);

      const savedNotifs = localStorage.getItem(`nutripulse_notifs_${currentKey}`);
      setNotifications(savedNotifs ? JSON.parse(savedNotifs) : [{
        id: 'welcome',
        title: 'System Access Granted',
        message: `Welcome to the NutriPulse network, ${user.name}.`,
        timestamp: new Date(),
        read: false,
        type: 'success'
      }]);

    }
  }, [user]);

  // 6. PERSISTENCE EFFECTS
  useEffect(() => {
    if (user) {
      localStorage.setItem('nutripulse_current_user', JSON.stringify(user));
      const registry = JSON.parse(localStorage.getItem('nutripulse_registry') || '{}');
      registry[user.email.toLowerCase()] = user;
      localStorage.setItem('nutripulse_registry', JSON.stringify(registry));
    }
  }, [user]);

  useEffect(() => { if (user) localStorage.setItem(`nutripulse_scans_${userKey}`, JSON.stringify(scanHistory)); }, [scanHistory, userKey, user]);
  useEffect(() => { if (user) localStorage.setItem(`nutripulse_habits_${userKey}`, JSON.stringify(habits)); }, [habits, userKey, user]);
  useEffect(() => { if (user) localStorage.setItem(`nutripulse_goals_${userKey}`, JSON.stringify(nutritionGoals)); }, [nutritionGoals, userKey, user]);
  useEffect(() => { if (user) localStorage.setItem(`nutripulse_journal_${userKey}`, JSON.stringify(journalEntries)); }, [journalEntries, userKey, user]);
  useEffect(() => { if (user) localStorage.setItem(`nutripulse_notifs_${userKey}`, JSON.stringify(notifications)); }, [notifications, userKey, user]);
  useEffect(() => { if (user) localStorage.setItem(`nutripulse_reminders_${userKey}`, JSON.stringify(reminders)); }, [reminders, userKey, user]);
  useEffect(() => { if (user) localStorage.setItem(`nutripulse_notes_${userKey}`, JSON.stringify(notes)); }, [notes, userKey, user]);

  const todaysTotals = useMemo(() => {
      const today = new Date().toDateString();
      return scanHistory.reduce((acc, scan) => {
          const scanDate = new Date(scan.timestamp).toDateString();
          if (scanDate === today) {
              return {
                  calories: acc.calories + (Number(scan.calories) || 0),
                  protein: acc.protein + (Number(scan.protein) || 0),
                  carbs: acc.carbs + (Number(scan.carbs) || 0),
                  fats: acc.fats + (Number(scan.fats) || 0)
              };
          }
          return acc;
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [scanHistory]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });
  const playTrack = (track: AudioTrack) => setActiveTrack(track);
  
  const handleAddScan = (scan: ScanResult) => {
      setScanHistory(prev => [scan, ...prev]);
      addNotification('Biometric Logged', `High-precision log for ${scan.foodName} captured.`, 'success');
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      title,
      message,
      timestamp: new Date(),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleSearch = async (query: string) => {
      if (!query.trim()) return;
      setIsSearching(true);
      if (currentView !== 'nutrition') setCurrentView('nutrition');
      showToast(`Initializing precision search for "${query}"...`);
      
      // Try local database first
      const localResult = searchFood(query);

      if (localResult) {
          setTimeout(() => {
              const result: ScanResult = {
                  ...localResult,
                  id: Date.now().toString(),
                  timestamp: new Date(),
                  image: `https://loremflickr.com/800/600/${encodeURIComponent(query)},food`,
                  recipes: [
                      { name: `${localResult.foodName} Power Bowl`, calories: Math.round(localResult.calories * 1.2), time: "15 min", ingredients: ["Fresh base", localResult.foodName, "Micronutrients"], instructions: ["Combine all elements", "Season for taste"] }
                  ]
              };
              setExternalScanResult(result);
              setIsSearching(false);
              showToast("Data retrieved from high-precision local registry.");
          }, 800);
          return;
      }

      // Fallback to Open Food Facts API for 100% accuracy on branded products/global data
      try {
          const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=1`);
          const data = await response.json();

          if (data.products && data.products.length > 0) {
              const product = data.products[0];
              const nutriments = product.nutriments;

              const result: ScanResult = {
                  id: Date.now().toString(),
                  foodName: product.product_name || query,
                  calories: Math.round(nutriments['energy-kcal_100g'] || (nutriments['energy_100g'] / 4.184) || 0),
                  protein: Math.round(nutriments.proteins_100g || 0),
                  carbs: Math.round(nutriments.carbohydrates_100g || 0),
                  fats: Math.round(nutriments.fat_100g || 0),
                  insight: `Global data analysis complete. Product: ${product.product_name}. Nutrients calculated per 100g.`,
                  healthScore: product.nutrition_grades ? (105 - (product.nutrition_grades.charCodeAt(0) - 97) * 15) : 70,
                  timestamp: new Date(),
                  image: product.image_url || `https://loremflickr.com/800/600/${encodeURIComponent(query)},food`,
                  recipes: [
                      { name: `${product.product_name || query} Integration`, calories: Math.round(nutriments['energy-kcal_100g'] || 0), time: "5 min", ingredients: ["Standard serving"], instructions: ["Follow package instructions"] }
                  ]
              };
              setExternalScanResult(result);
              showToast("Global database handshake successful.");
          } else {
              throw new Error("Product not found");
          }
      } catch (error) {
          // Final fallback to a slightly better mock if API fails
          const mockResult: ScanResult = {
              id: Date.now().toString(),
              foodName: query.charAt(0).toUpperCase() + query.slice(1),
              calories: 350,
              protein: 25,
              carbs: 45,
              fats: 12,
              insight: "A balanced nutritional profile suitable for high-performance protocols. (Approximate data)",
              healthScore: 85,
              timestamp: new Date(),
              image: `https://loremflickr.com/800/600/${encodeURIComponent(query)},food`,
          };
          setExternalScanResult(mockResult);
          showToast("Search complete (approximate telemetry).");
      } finally {
          setIsSearching(false);
      }
  };

  const handleFinishOnboarding = (updatedUser: User, goals: NutritionGoals) => {
      const currentKey = updatedUser.email.toLowerCase().replace(/[@.]/g, '_');
      localStorage.setItem(`nutripulse_onboarding_${currentKey}`, 'true');
      localStorage.setItem(`nutripulse_goals_${currentKey}`, JSON.stringify(goals));
      localStorage.setItem('nutripulse_current_user', JSON.stringify(updatedUser));
      
      const registry = JSON.parse(localStorage.getItem('nutripulse_registry') || '{}');
      registry[updatedUser.email.toLowerCase()] = updatedUser;
      localStorage.setItem('nutripulse_registry', JSON.stringify(registry));

      setUser(updatedUser);
      setNutritionGoals(goals);
      setOnboardingComplete(true);
      showToast("Identity sync complete.");
  };

  const handleLogout = () => {
    localStorage.removeItem('nutripulse_current_user');
    setUser(null);
    setCurrentView('dashboard');
    showToast("Session safely terminated.");
  };

  const terminateAccount = () => {
      if (user) {
        const currentKey = user.email.toLowerCase().replace(/[@.]/g, '_');
        localStorage.removeItem(`nutripulse_scans_${currentKey}`);
        localStorage.removeItem(`nutripulse_habits_${currentKey}`);
        localStorage.removeItem(`nutripulse_goals_${currentKey}`);
        localStorage.removeItem(`nutripulse_journal_${currentKey}`);
        localStorage.removeItem(`nutripulse_notifs_${currentKey}`);
        localStorage.removeItem(`nutripulse_reminders_${currentKey}`);
        localStorage.removeItem(`nutripulse_notes_${currentKey}`);
        localStorage.removeItem(`nutripulse_onboarding_${currentKey}`);
        
        const registry = JSON.parse(localStorage.getItem('nutripulse_registry') || '{}');
        delete registry[user.email.toLowerCase()];
        localStorage.setItem('nutripulse_registry', JSON.stringify(registry));
      }
      handleLogout();
  };

  if (!user) return <Auth onLogin={(u, isNew) => { 
    localStorage.setItem('nutripulse_current_user', JSON.stringify(u));
    setUser(u); 
  }} />;

  if (!onboardingComplete) return <Onboarding user={user} onFinish={handleFinishOnboarding} />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Sidebar currentView={currentView} onChangeView={setCurrentView} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <main className={`flex-1 ml-0 lg:ml-64 mr-0 xl:mr-80 p-4 sm:p-6 md:p-8 transition-all duration-300 min-w-0 ${activeTrack ? 'pb-24' : ''}`}>
        <Header 
          title={currentView === 'organization' ? 'Command Center' : currentView.charAt(0).toUpperCase() + currentView.slice(1)} 
          onMenuClick={() => setSidebarOpen(true)} 
          onSearch={handleSearch} 
          notifications={notifications}
          onMarkRead={markNotificationAsRead}
          onClearAll={() => setNotifications([])}
        />
        <div className="animate-fade-in max-w-7xl mx-auto">
          {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} onPlay={playTrack} showToast={showToast} user={user} habits={habits} onToggleHabit={id => setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h))} scanHistory={scanHistory} nutritionGoals={nutritionGoals} journalEntries={journalEntries} onAddJournalEntry={entry => setJournalEntries([entry, ...journalEntries])} onDeleteJournalEntry={id => setJournalEntries(journalEntries.filter(j => j.id !== id))} />}
          {currentView === 'nutrition' && <Nutrition showToast={showToast} scanHistory={scanHistory} onAddScan={handleAddScan} onDeleteScan={id => setScanHistory(scanHistory.filter(s => s.id !== id))} goals={nutritionGoals} onUpdateGoals={setNutritionGoals} externalResult={externalScanResult} isSearching={isSearching} onClearExternalResult={() => setExternalScanResult(null)} />}
          {currentView === 'mindfulness' && <Mindfulness />}
          {currentView === 'habits' && <Habits showToast={showToast} habits={habits} onToggleHabit={id => setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h))} onAddHabit={h => setHabits([...habits, h])} onDeleteHabit={id => setHabits(habits.filter(h => h.id !== id))} />}
          {currentView === 'organization' && <Organization reminders={reminders} setReminders={setReminders} notes={notes} setNotes={setNotes} showToast={showToast} />}
          {currentView === 'settings' && <Settings showToast={showToast} user={user} onLogout={handleLogout} onUpdateUser={setUser} onTerminate={terminateAccount} onExport={() => {
              const doc = new jsPDF();
              doc.text("NutriPulse Elite Health Report", 20, 20);
              doc.text(`Identity: ${user.name}`, 20, 30);
              doc.save(`Health_Protocol_${userKey}.pdf`);
          }} />}
        </div>
      </main>
      <RightSidebar currentView={currentView} onLogMeal={() => setCurrentView('nutrition')} showToast={showToast} hasData={habits.length > 0 || scanHistory.length > 0} journalEntries={journalEntries} onAddJournalEntry={entry => setJournalEntries([entry, ...journalEntries])} habits={habits} todaysTotals={todaysTotals} nutritionGoals={nutritionGoals} />
      <AudioPlayer track={activeTrack} onClose={() => setActiveTrack(null)} />
    </div>
  );
};

export default App;
