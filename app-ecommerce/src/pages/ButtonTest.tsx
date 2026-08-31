import { Button } from '../components/Button/Button'

export function ButtonTest() {
  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

      <section>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Sólidas
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Button label="Primary Dark" variant="primaryDark" />
          <Button label="Primary" variant="primary" />
          <Button label="Accent" variant="accent" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Danger Solid" variant="dangerSolid" />
        </div>
      </section>

      <section>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Suaves
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Button label="Soft" variant="soft" />
          <Button label="Secondary Soft" variant="secondarySoft" />
          <Button label="Danger" variant="danger" />
          <Button label="Success" variant="success" />
          <Button label="Warning" variant="warning" />
        </div>
      </section>

      <section>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Outline
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Button label="Outline" variant="outline" />
          <Button label="Outline Secondary" variant="outlineSecondary" />
          <Button label="Outline Danger" variant="outlineDanger" />
        </div>
      </section>

      <section>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Ghost
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Button label="Ghost" variant="ghost" />
          <Button label="Disabled" variant="primary" disabled />
        </div>
      </section>

      <section>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Pill
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Button label="Primary" variant="primary" pill />
          <Button label="Accent" variant="accent" pill />
          <Button label="Soft" variant="soft" pill />
          <Button label="Outline" variant="outline" pill />
        </div>
      </section>

      <section>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Tamaños
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <Button label="Small" variant="primary" size="sm" />
          <Button label="Medium" variant="primary" size="md" />
          <Button label="Large" variant="primary" size="lg" />
        </div>
      </section>

    </div>
  )
}