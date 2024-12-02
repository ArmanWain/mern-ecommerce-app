const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-1 pt-5">
      <p className="text-center mt-1 fw-bold">
        Shopico - {year}, All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;
