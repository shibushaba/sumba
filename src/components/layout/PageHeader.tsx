interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-muted sm:text-base">{description}</p>
      ) : null}
    </header>
  )
}
