// resources/js/Components/PageTransition.jsx
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition({ children, keyProp }) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={keyProp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
