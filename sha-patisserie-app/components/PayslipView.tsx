'use client';

export default function PayslipView() {
  return (
    <div className="w-full bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
      <h2 className="text-lg font-serif font-bold text-stone-800 mb-2">
        Payslips
      </h2>
      <p className="text-xs text-stone-500 mb-4">
        Download your recent pay summaries and payslip PDFs.
      </p>

      <div className="space-y-3">
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-bold text-stone-800">Pay Period: Sept 01 - Sept 15</p>
          </div>
          <button className="bg-stone-800 text-white text-xs px-3.5 py-2 rounded-xl font-medium hover:bg-stone-900 transition-colors">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}