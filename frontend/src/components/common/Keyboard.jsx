import React from 'react';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

const Keyboard = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                type: "spring", 
                stiffness: 100, 
                damping: 10 
            }}
            className="w-full max-w-[900px] mx-auto -mt-52"
        >
            <Spline
                className='w-full h-auto' 
                scene="https://prod.spline.design/liWla8d1tIE6Sg15/scene.splinecode"
            />
        </motion.div>
    );
};

export default Keyboard;

// scene="https://prod.spline.design/liWla8d1tIE6Sg15/scene.splinecode"
