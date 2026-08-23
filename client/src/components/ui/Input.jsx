

const Input = (props)=> {

    const label = props.label;
    const name = props.name;
    const type = props.type || 'text';
    const value = props.value;
    const onChange = props.onChange;
    const required = props.required;
    const placeholder = props.placeholder;
    const className = props.className || '';

    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>

            {label && (
                <label htmlFor={name} className="text-sm font-medium text-ink-700">{label}</label>
            )}

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"/>
        </div>
    )
};


export default Input;