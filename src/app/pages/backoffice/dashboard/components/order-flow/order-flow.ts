import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import * as echarts from 'echarts';
import { OrderFlowPoint } from '../../../../../../core/features/dashboard/models/dashboard.model';

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

@Component({
  imports: [],
  selector: 'app-order-flow',
  styleUrl: './order-flow.css',
  templateUrl: './order-flow.html',
})
export class OrderFlow implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  readonly data = input<OrderFlowPoint[]>([]);

  period = signal<'monthly' | 'annual'>('monthly');
  private chart: echarts.ECharts | null = null;
  private resizeListener = () => this.chart?.resize();

  constructor() {
    effect(() => {
      this.data();
      this.period();
      this.updateChartData();
    });
  }

  ngAfterViewInit(): void {
    this.initChart();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
    this.chart?.dispose();
  }

  setPeriod(type: 'monthly' | 'annual') {
    this.period.set(type);
  }

  private initChart() {
    const element = this.chartContainer.nativeElement;
    this.chart = echarts.init(element);
    this.updateChartData();
  }

  private monthlyPoints(): { label: string; done: number; canceledOrRejected: number; inProgress: number }[] {
    return [...this.data()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((point) => ({
        label: MONTH_LABELS[Number(point.month.split('-')[1]) - 1] ?? point.month,
        done: point.done,
        canceledOrRejected: point.canceledOrRejected,
        inProgress: point.inProgress,
      }));
  }

  private annualPoints(): { label: string; done: number; canceledOrRejected: number; inProgress: number }[] {
    const byYear = new Map<string, { done: number; canceledOrRejected: number; inProgress: number }>();

    for (const point of this.data()) {
      const year = point.month.split('-')[0];
      const current = byYear.get(year) ?? { done: 0, canceledOrRejected: 0, inProgress: 0 };
      current.done += point.done;
      current.canceledOrRejected += point.canceledOrRejected;
      current.inProgress += point.inProgress;
      byYear.set(year, current);
    }

    return [...byYear.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, totals]) => ({ label: year, ...totals }));
  }

  private updateChartData() {
    if (!this.chart) return;

    const isMonthly = this.period() === 'monthly';
    const points = isMonthly ? this.monthlyPoints() : this.annualPoints();

    const option: echarts.EChartsOption = {
      grid: {
        top: 10,
        bottom: 10,
        left: 0,
        right: 0,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        show: false,
        data: points.map((point) => point.label),
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          name: 'Concluídos',
          data: points.map((point) => point.done),
          type: 'bar',
          itemStyle: {
            borderRadius: [12, 12, 0, 0],
            color: '#3F624E',
          },
          barWidth: '35%',
        },
        {
          name: 'Em curso',
          data: points.map((point) => point.inProgress),
          type: 'bar',
          itemStyle: {
            borderRadius: [12, 12, 0, 0],
            color: '#96D786',
          },
          barWidth: '35%',
        },
        {
          name: 'Cancelados/Rejeitados',
          data: points.map((point) => point.canceledOrRejected),
          type: 'bar',
          itemStyle: {
            borderRadius: [12, 12, 0, 0],
            color: '#D3DCD6',
          },
          barWidth: '35%',
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none',
        },
        formatter: (params: any) => {
          const [done, inProgress, canceled] = params;
          return `<b>${done.axisValue}</b><br/>Concluídos: ${done.value}<br/>Em curso: ${inProgress.value}<br/>Cancelados/Rejeitados: ${canceled.value}`;
        },
      },
    };

    this.chart.setOption(option, true);
  }
}
