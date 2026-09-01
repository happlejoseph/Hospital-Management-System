import { Children } from "react";


const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-300',
    secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 focus:ring-ink-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
    ghost: 'text-ink-600 hover:bg-ink-100 focus:ring-ink-200'
};


const Button = ({children, variant = 'primary'}) => {