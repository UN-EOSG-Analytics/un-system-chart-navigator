'use client';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import data from '../../../../public/entity_link_verification_results.json';

export default function DevPage() {
    const urlTemplate = (rowData: typeof data[0]) => {
        return <a href={rowData.url} target="_blank" rel="noopener noreferrer" className="text-un-blue hover:underline">{rowData.url}</a>;
    };

    const redirectTemplate = (rowData: typeof data[0]) => {
        return rowData.redirect_url ? <a href={rowData.redirect_url} target="_blank" rel="noopener noreferrer" className="text-un-blue hover:underline">{rowData.redirect_url}</a> : null;
    };

    const accessibleTemplate = (rowData: typeof data[0]) => {
        return (
            <span className={`text-xl font-semibold ${rowData.accessible ? 'text-green-600' : 'text-red-600'}`}>
                {rowData.accessible ? '✓' : '✗'}
            </span>
        );
    };

    const statusTemplate = (rowData: typeof data[0]) => {
        return `${rowData.status_code} [${rowData.status_name}]`;
    };

    const contentLengthTemplate = (rowData: typeof data[0]) => {
        return <span className="font-mono">{rowData.content_length?.toLocaleString() ?? '-'}</span>;
    };

    return (
        <main className="min-h-screen w-full px-4 py-4">
            <div className="w-full max-w-[94%] mx-auto flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                        Verification Results: <code className="text-un-blue bg-gray-100 px-2 py-1 rounded text-2xl sm:text-3xl">entity_link</code>
                    </h1>
                </div>
                <DataTable value={data} showGridlines>
                    <Column field="entity" header="Entity" sortable />
                    <Column field="url" header="URL" body={urlTemplate} />
                    <Column field="accessible" header="Accessible" sortable body={accessibleTemplate} />
                    <Column field="status_code" header="Status" sortable body={statusTemplate} />
                    <Column field="content_length" header="Content Length" sortable body={contentLengthTemplate} />
                    <Column field="redirect_url" header="Redirect" body={redirectTemplate} />
                </DataTable>
            </div>
        </main>
    );
}