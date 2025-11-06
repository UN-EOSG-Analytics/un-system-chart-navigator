export const metadata = {
    title: 'Contribute | UN System Chart Navigator',
    description: 'Help improve the UN System Chart by suggesting additions or corrections to entity information.',
};

export default function ContributePage() {
    return (
        <div className="fixed inset-0 w-full h-full">
            <iframe 
                className="airtable-embed" 
                src="https://airtable.com/embed/appJtP9H7xvsl3yAN/pagDuSV8RUxFhfO1k/form" 
                frameBorder="0" 
                width="100%" 
                height="100%"
                style={{ background: 'transparent', border: 'none' }}
            />
        </div>
    );
}
