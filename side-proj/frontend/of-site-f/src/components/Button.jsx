export default function Button({ children, className="", ...rest }) {
  return (
    <button className={`btn btn-primary ${className}`} {...rest}>{children}</button>
  );
}
