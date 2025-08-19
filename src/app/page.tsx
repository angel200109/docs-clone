import Link from "next/link";
const documentHome = () => {
  return (
    <div className="flex min-h-screen justify-center items-center">
      Click <Link href="documents/123">here</Link> to go to documentId
    </div>
  );
};

export default documentHome;
