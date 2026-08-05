function SettingsTab({ theme, setTheme, openFolderPicker }) {
   const [defSaveDir, setDefSaveDir] = 
useState(() => localStorage.getItem('rfine_def_save_dir') || '');
   const [repoPath, setRepoPath] = 
useState(() => localStorage.getItem('rfine_repo_path') || '7blackstar/RFINE');
   const [successSaved, 
setSuccessSaved] = useState(false);
 
   const [favorites, setFavorites] = useState(() => {
     
try {
       return JSON.parse(localStorage.getItem('rfine_favorites')) || [];
     } catch {
    
   return [];
     }
   });
 
   const saveSettings = () => {
     
localStorage.setItem('rfine_def_save_dir', defSaveDir);
     localStorage.setItem('rfine_repo_path', 
repoPath);
     setSuccessSaved(true);
     setTimeout(() => setSuccessSaved(false), 3000);
   
};
 
   const removeFavorite = (pathToRemove) => {
     const updated = favorites.filter(f => f 
!== pathToRemove);
     setFavorites(updated);
     localStorage.setItem('rfine_favorites', 
JSON.stringify(updated));
   };
 
   const handleResetAll = () => {
     if 
(window.confirm('Are you sure you want to reset all settings to defaults? This will clear favorites and paths.')) 
{
       localStorage.clear();
       setDefSaveDir('');
       setFavorites([]);
       
setTheme('dark');
       alert('All settings reset to defaults.');
     }
   };
 
  
 const handleOpenPicker = () => {
     openFolderPicker(defSaveDir, (selectedPath) => {
       
setDefSaveDir(selectedPath);
     });
   };
 
   return (
     <div 
className="animate-fade-in animate-slide-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 
'15px', position: 'relative', padding: '24px 30px' }}>
       <div>
         <h1 style={{ margin: '0 0 
6px 0', fontSize: '20px', fontWeight: '900', color: 'var(--color-white)' }}>SYSTEM SETTINGS</h1>
         <p 
style={{ color: 'var(--color-slate)', fontSize: '11px', margin: 0 }}>Configure default output targets, favorite 
workspaces, and theme options.</p>
       </div>
The above content does NOT show the entire file contents. 
If you need to view any lines of the file which were not shown to complete your task, call this tool again to view 
those lines.
"}