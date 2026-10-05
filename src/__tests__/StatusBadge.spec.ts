import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders the status text and class', () => {
    const w = mount(StatusBadge, { props: { status: 'overdue' } })
    expect(w.text()).toBe('overdue')
    expect(w.classes()).toContain('overdue')
  })
})
