export const HighlightKeyword: React.FC<{
    text: string;
    highlights: Record<string, string>;
    translations: Record<string, string>;
}> = ({ text, highlights, translations }) => {

    const regex = new RegExp(`(${Object.values(translations).join("|")})`, "gi");


    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {

                const subParts = part.split(/(\n)/g);

                return subParts.map((sub, subIndex) => {

                    if (sub === "\n") return <br key={`${index}-${subIndex}`} />;


                    const logicKey = Object.keys(translations).find(
                        (key) =>
                            translations[key].toLowerCase() === sub.toLowerCase()
                    );

                    if (logicKey && highlights[logicKey]) {
                        return (
                            <span key={`${index}-${subIndex}`} className={highlights[logicKey]}>
                                {sub}
                            </span>
                        );
                    }

                    return <span key={`${index}-${subIndex}`}>{sub}</span>;
                });
            })}
        </>
    );
};
