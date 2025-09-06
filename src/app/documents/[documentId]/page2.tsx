
import { Id } from "../../../../convex/_generated/dataModel";
import Document2 from "./Document2";

export default async function Page({ params }: { params: Promise<{ documentId: Id<"documents"> }> }) {
    const { documentId } = await params;
    return <Document2 documentId={documentId} />;
}
