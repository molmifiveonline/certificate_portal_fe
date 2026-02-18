import React from "react";
import { RefreshCcw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "../../lib/utils/utils";

/**
 * Reusable DataTable component for all listing pages.
 *
 * @param {Object} props
 * @param {Array<{key: string, label: string, align?: string, sortable?: boolean, render?: Function}>} props.columns
 * @param {Array} props.data
 * @param {boolean} props.loading
 * @param {string} [props.emptyMessage="No records found."]
 * @param {number} [props.currentPage=1]
 * @param {number} [props.limit=10]
 * @param {boolean} [props.serialNumber=true]
 * @param {string} [props.sortBy]
 * @param {string} [props.sortOrder]
 * @param {Function} [props.onSort]
 * @param {string} [props.rowKey="id"]
 */
const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    emptyMessage = "No records found.",
    currentPage = 1,
    limit = 10,
    serialNumber = true,
    sortBy,
    sortOrder,
    onSort,
    rowKey = "id",
}) => {
    const totalColumns = columns.length + (serialNumber ? 1 : 0);

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
        return sortOrder === "asc"
            ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" />
            : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    const getAlignClass = (align) => {
        if (align === "center") return "text-center";
        if (align === "right") return "text-right";
        return "text-left";
    };

    return (
        <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white/40 shadow-xl overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/40 border-b border-slate-200/60">
                            {serialNumber && (
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">
                                    Sr. No.
                                </th>
                            )}
                            {columns.map((col) => {
                                const alignCls = getAlignClass(col.align);
                                const responsiveCls = col.hiddenOnMobile ? "hidden md:table-cell" : col.hiddenOnTablet ? "hidden lg:table-cell" : "";

                                if (col.sortable && onSort) {
                                    return (
                                        <th
                                            key={col.key}
                                            className={cn("px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors select-none", alignCls, responsiveCls)}
                                            onClick={() => onSort(col.key)}
                                        >
                                            <div className={`flex items-center ${col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""}`}>
                                                {col.label}
                                                <SortIcon column={col.key} />
                                            </div>
                                        </th>
                                    );
                                }
                                return (
                                    <th
                                        key={col.key}
                                        className={cn("px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider", alignCls, responsiveCls)}
                                    >
                                        {col.label}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {loading ? (
                            <tr>
                                <td colSpan={totalColumns} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCcw className="w-4 h-4 animate-spin" />
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={totalColumns} className="px-6 py-12 text-center text-slate-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => (
                                <tr key={row[rowKey] || idx} className="hover:bg-white/40 transition-colors">
                                    {serialNumber && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                            {(currentPage - 1) * limit + idx + 1}
                                        </td>
                                    )}
                                    {columns.map((col) => {
                                        const alignCls = getAlignClass(col.align);
                                        const responsiveCls = col.hiddenOnMobile ? "hidden md:table-cell" : col.hiddenOnTablet ? "hidden lg:table-cell" : "";

                                        return (
                                            <td
                                                key={col.key}
                                                className={cn("px-6 py-4 whitespace-nowrap text-sm text-slate-600", alignCls, responsiveCls)}
                                            >
                                                {col.render
                                                    ? col.render(row[col.key], row, idx)
                                                    : row[col.key] ?? "-"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
