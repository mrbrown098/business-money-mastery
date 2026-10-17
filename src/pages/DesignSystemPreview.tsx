import React, { useState } from 'react';
import {
  Button,
  Badge,
  Chip,
  GlassCard,
  KpiCard,
  Input,
  Select,
  StatusPill,
  EmptyState,
  PageHeader,
  Skeleton,
  Modal,
  useToast,
  DataTable,
  Sparkline,
  BarChart,
  DonutChart,
} from '../ui';
import { DollarSign, Sparkles, Layers } from 'lucide-react';

export const DesignSystemPreview: React.FC = () => {
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChip, setActiveChip] = useState('2026-10');

  const sampleTableData = [
    { id: '1', name: 'Cypermethrin 100ml', type: 'Product', stock: '95 packs', status: 'In Stock' },
    { id: '2', name: 'Cypermethrin Technical', type: 'Material', stock: '10,000 ml', status: 'In Stock' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Luxury Glass Design System Preview"
        subtitle="Live catalog demonstrating all src/ui/ components in active, hover, disabled, and loading states."
      />

      {/* Buttons Section */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-[#f5c04a] uppercase tracking-wider">
          1. Pill Buttons (`Button`)
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => addToast('Primary green glow button clicked!', 'success')}>
            Primary Green Glow
          </Button>
          <Button variant="gold" onClick={() => addToast('Gold button clicked!', 'info')}>
            Gold Gradient
          </Button>
          <Button variant="ghost" onClick={() => addToast('Ghost button clicked!', 'info')}>
            Ghost Glass
          </Button>
          <Button variant="danger" onClick={() => addToast('Danger button clicked!', 'error')}>
            Danger Red
          </Button>
          <Button variant="primary" disabled>
            Disabled Button
          </Button>
        </div>
      </GlassCard>

      {/* Badges & Chips Section */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-[#f5c04a] uppercase tracking-wider">
          2. Badges & Filter Chips (`Badge` & `Chip`)
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="gold">Gold Badge</Badge>
          <Badge variant="cyan">Cyan Badge</Badge>
          <Badge variant="green">Green Badge</Badge>
          <Badge variant="orange">Orange Badge</Badge>
          <Badge variant="pink">Pink Badge</Badge>
          <Badge variant="muted">Muted Badge</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          {['2026-10', '2026-09', '2026-08', '2026-07'].map((m) => (
            <Chip key={m} active={activeChip === m} onClick={() => setActiveChip(m)}>
              {m}
            </Chip>
          ))}
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-[#f5c04a] uppercase tracking-wider">
          3. Orbitron KPI Cards (`KpiCard`)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            title="Udhaar Balance"
            value="Rs 1,900.00"
            subtitle="Customer credit"
            icon={<DollarSign className="w-5 h-5" />}
            accentColor="orange"
          />
          <KpiCard
            title="Sales"
            value="Rs 1,400.00"
            subtitle="Net revenue"
            icon={<Layers className="w-5 h-5" />}
            accentColor="cyan"
          />
          <KpiCard
            hero
            title="Net Bachat"
            value="Rs 350.00"
            subtitle="Profit Margin: 25%"
            icon={<Sparkles className="w-5 h-5" />}
            accentColor="gold"
          />
        </div>
      </GlassCard>

      {/* Form Controls */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-[#f5c04a] uppercase tracking-wider">
          4. Form Inputs & Selects (`Input` & `Select`)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Customer Name" placeholder="e.g. Tariq Agri Store" />
          <Select label="Payment Method">
            <option value="cash">Cash Payment</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </Select>
          <Input label="With Error State" error="Required field in 44px touch height" defaultValue="Invalid" />
        </div>
      </GlassCard>

      {/* Status & Overlays */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-[#f5c04a] uppercase tracking-wider">
          5. Status Pills, Modals & Toast Triggers
        </h3>
        <div className="flex flex-wrap items-center gap-4">
          <StatusPill online={true} />
          <StatusPill online={false} />
          <Button variant="ghost" onClick={() => setIsModalOpen(true)}>
            Open Glass Modal
          </Button>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Glass Dialog Modal">
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            This is a translucent glass modal with backdrop blur (falling back to bottom-sheet on mobile devices).
          </p>
          <Button variant="gold" size="sm" onClick={() => setIsModalOpen(false)}>
            Close Modal
          </Button>
        </Modal>
      </GlassCard>

      {/* SVG Charts */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-[#f5c04a] uppercase tracking-wider">
          6. Custom Inline-SVG Charts (`BarChart`, `DonutChart`, `Sparkline`)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-slate-400 mb-2">Bar Chart Trend:</div>
            <BarChart
              data={[
                { label: 'May', value: 12000 },
                { label: 'Jun', value: 18000 },
                { label: 'Jul', value: 25000 },
                { label: 'Aug', value: 31000 },
                { label: 'Sep', value: 28000 },
                { label: 'Oct', value: 42000 },
              ]}
              color="#f5c04a"
            />
          </div>

          <div>
            <div className="text-xs text-slate-400 mb-2">Donut Chart Expenses:</div>
            <DonutChart
              data={[
                { label: 'petrol', value: 500, color: '#ff5d7a' },
                { label: 'labour', value: 1200, color: '#00e5ff' },
                { label: 'rent', value: 4500, color: '#f5c04a' },
              ]}
            />
          </div>
        </div>

        <div className="pt-3 flex items-center space-x-4 border-t border-white/10">
          <span className="text-xs text-slate-400 font-semibold">Sparkline Preview:</span>
          <Sparkline data={[10, 15, 8, 22, 19, 35, 28, 45]} color="#00e5ff" />
        </div>
      </GlassCard>

      {/* Data Table View */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-[#f5c04a] uppercase tracking-wider">
          7. Glass Data Table (`DataTable`)
        </h3>
        <DataTable
          data={sampleTableData}
          keyExtractor={(r) => r.id}
          columns={[
            { header: 'Name', accessorKey: 'name' },
            { header: 'Type', accessorKey: 'type' },
            { header: 'Stock', accessorKey: 'stock', align: 'right' },
            {
              header: 'Status',
              align: 'right',
              cell: (row) => <Badge variant="green">{row.status}</Badge>,
            },
          ]}
        />
      </GlassCard>

      {/* Skeleton Loading State */}
      <GlassCard className="space-y-4">
        <h3 className="text-sm font-bold text-[#f5c04a] uppercase tracking-wider">
          8. Shimmer Loading (`Skeleton`)
        </h3>
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </GlassCard>

      {/* Empty State */}
      <EmptyState
        title="Sample Empty State"
        description="Friendly Roman Urdu empty state for empty records."
        actionText="Sample CTA Button"
        onAction={() => addToast('Empty state CTA clicked!')}
        icon={<Sparkles className="w-8 h-8 text-[#f5c04a]" />}
      />
    </div>
  );
};
