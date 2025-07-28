import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Building2, ArrowRight, Check } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary-soft/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="bg-primary rounded-full p-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Kontu - Gestão Fiscal Inteligente
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl">
            Simplifique a gestão fiscal dos seus clientes com nossa plataforma completa.
            Tenha controle total das obrigações tributárias em um só lugar.
          </p>
          
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link to="/auth" className="gap-2">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-background rounded-t-3xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Recursos que facilitam sua rotina fiscal
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Controle Centralizado",
                description: "Gerencie todos os clientes em um único painel"
              },
              {
                title: "Alertas Automáticos",
                description: "Notificações para prazos importantes"
              },
              {
                title: "Relatórios Customizáveis",
                description: "Gere relatórios detalhados com um clique"
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Kontu. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
