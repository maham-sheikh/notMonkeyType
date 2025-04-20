import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
 Keyboard, Users, User, GamepadIcon, 
 TrophyIcon, ChevronRightIcon, CodeIcon, 
 ZapIcon, HeartIcon, MousePointerClickIcon 
} from "lucide-react";

const GameMenu = () => {
 const [selectedMode, setSelectedMode] = useState('single');
 const [hoveredStyle, setHoveredStyle] = useState(null);

 const gameStyles = [
   { 
     icon: <CodeIcon className="text-white" size={36} />, 
     title: "Code Typing", 
     description: "Programming syntax challenges",
     color: "from-accent/40 to-accent",
     bgEffect: "group-hover:bg-accent/10"
   },
   { 
     icon: <ZapIcon className="text-white" size={36} />, 
     title: "Speed and Accuracy Challenge", 
     description: "Maximum typing velocity test with Precision",
          color: "from-accent/40 to-accent",
     bgEffect: "group-hover:bg-accent/10"
   }
 ];

 return (
   <div className="min-h-screen  flex items-start mt12 justify-center p-2 relative overflow-hidden">
     <div className="absolute inset-0 bg-noise opacity-20"></div>
     
     <div className="w-full max-w-6xl bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden relative z-10">
       <div className="grid md:grid-cols-2 gap-8 p-8">
         <div className="space-y-6">
           <div className="flex items-center gap-4 animate-fade-in">
             <Keyboard className="text-accent animate-pulse" size={48} />
             <h1 className="text-5xl font-bold text-white tracking-tight">
               NOT Monkey Type
             </h1>
           </div>
           <p className="text-xl text-gray-300 animate-slide-in">
             Elevate Your Typing Skills Through Intelligent Challenges
           </p>

           <div className="space-y-4">
             {['single', 'multi'].map((mode) => (
               <div 
                 key={mode}
                 onClick={() => setSelectedMode(mode)}
                 className={`group flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer
                   ${selectedMode === mode 
                     ? 'bg-white/20 ring-2 ring-accent' 
                     : 'bg-white/10 hover:bg-white/20 hover:scale-[1.02]'}`}
               >
                 <div className="flex items-center gap-4">
                   {mode === 'single' ? (
                     <User className="text-accent" size={36} />
                   ) : (
                     <Users className="text-accent/40" size={36} />
                   )}
                   <div>
                     <h3 className="text-2xl font-bold text-white">
                       {mode === 'single' ? 'Single Player' : 'Multiplayer'}
                     </h3>
                     <p className="text-gray-300">
                       {mode === 'single' ? 'Personal Growth & Tracking' : 'Real-time Competitive Typing'}
                     </p>
                   </div>
                 </div>
                 <ChevronRightIcon className="text-white group-hover:translate-x-1 transition-transform" />
               </div>
             ))}
           </div>
         </div>

         <div className="space-y-6">
           <h2 className="text-3xl font-bold text-white">Game Styles</h2>
           <div className="grid grid-cols-1 gap-4">
             {gameStyles.map((style, index) => (
               <div 
                 key={index} 
                 onMouseEnter={() => setHoveredStyle(index)}
                 onMouseLeave={() => setHoveredStyle(null)}
                 className={`group bg-gradient-to-br ${style.color} rounded-xl p-4 flex items-center gap-4 
                   transition-transform relative overflow-hidden 
                   ${hoveredStyle === index ? ' shadow-2xl' : ''}`}
               >
                 <div className={`absolute inset-0 ${style.bgEffect} opacity-0 group-hover:opacity-100 transition-all`}></div>
                 <div className="relative z-10">
                   {style.icon}
                   <div>
                     <h4 className="text-xl font-bold text-white">{style.title}</h4>
                     <p className="text-gray-200">{style.description}</p>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>

       {selectedMode && (
         <div className="w-full bg-white/5 p-4 flex justify-end">
           <Link 
             to={`/${selectedMode}-player`} 
             className="bg-accent text-white px-6 py-3 rounded-full flex items-center gap-2 
               hover:bg-accentHover transition-colors group"
           >
             Start Game 
             <MousePointerClickIcon className="group-hover:scale-125 transition-transform" />
           </Link>
         </div>
       )}
     </div>

     <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob"></div>
     <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
   </div>
 );
};

export default GameMenu;