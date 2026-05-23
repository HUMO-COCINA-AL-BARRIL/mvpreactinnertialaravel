export default function ApplicationLogo({ className = '', ...props }) {
    return <img {...props} src="/images/logo_humo.jpg" alt="HUMO" className={className} />;
}
