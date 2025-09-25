import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/80 backdrop-blur-md border-t border-gray-200 py-8"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="text-gray-600 italic text-lg"
        >
          "Isn't the whole point of a trip to have fun? Keep it simply pleasant and stop overthinking!"
        </motion.p>
      </div>
    </motion.footer>
  );
};

export default Footer; 