
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../components/providers/AuthProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { Check, Zap, Shield, AlertCircle, CheckCircle2, Box, Rocket, Crown, Star, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  color: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    id: 'free',
    name: "Free",
    price: "R$ 0/mês",
    description: "Para explorar a plataforma.",
    features: ["Acesso Limitado", "Geração Nano", "Sem uso comercial"],
    icon: Box,
    color: "text-slate-400",
    popular: false
  },
  {
    id: 'starter',
    name: "Starter",
    price: "R$ 97/mês",
    description: "Para criadores iniciantes.",
    features: ["500 Créditos Mensais", "Geração de Imagens", "Licença Comercial", "Suporte por Email"],
    icon: Rocket,
    color: "text-blue-400",
    popular: false
  },
  {
    id: 'pro',
    name: "Pro",
    price: "R$ 197/mês",
    description: "Para profissionais de marketing.",
    features: ["1.500 Créditos Mensais", "Acesso ao Modelo Banana", "Editor Mágico", "Suporte Prioritário", "Sem Marca D'água"],
    icon: Star,
    color: "text-primary",
    popular: true
  },
  {
    id: 'agency',
    name: "Agency",
    price: "R$ 497/mês",
    description: "Potência máxima para times.",
    features: ["4.000 Créditos Mensais", "Acesso ao Modelo Flow (4K)", "API Access", "Gerente Dedicado", "Múltiplos Usuários"],
    icon: Crown,
    color: "text-purple-400",
    popular: false
  }
];

const planOrder: Record<string, number> = {
    'FREE': 0,
    'STARTER': 1,
    'PRO': 2,
    'AGENCY': 3
};

export default function PlansPage() {
  const { user } = useAuth();
  // SIMULAÇÃO DE ESTADO: Agência
  const [currentPlan, setCurrentPlan] = useState<string>('AGENCY'); 
  const [loading, setLoading] = useState(true);
  
  // Feedback States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      if (!user) {
          setLoading(false);
          return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('plan_id')
          .eq('id', user.id)
          .single();
        
        if (data && data.plan_id) {
            // Uncomment to use real data
            // setCurrentPlan(data.plan_id);
        }
        // Mantendo simulação 'Agency' conforme pedido
        setCurrentPlan('AGENCY');
      } catch (err) {
        console.error("Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [user]);

  const getButtonState = (tierName: string) => {
      const currentOrder = planOrder[currentPlan.toUpperCase()] || 0;
      const tierOrder = planOrder[tierName.toUpperCase()] || 0;

      if (currentOrder === tierOrder) return 'current';
      if (currentOrder > tierOrder) return 'downgrade';
      return 'upgrade';
  };

  const handleAction = (tierName: string, action: 'upgrade' | 'downgrade') => {
      setErrorMsg(null);
      setSuccessMsg(null);
      const actionText = action === 'upgrade' ? 'Upgrade' : 'Downgrade';
      setInfoMsg(`Iniciando fluxo de ${actionText} para o plano ${tierName}...`);
      setTimeout(() => setInfoMsg(null), 3000);
  };

  const handleBuyCredits = (pkgAmount: number) => {
      setErrorMsg(null);
      setSuccessMsg(null);
      setInfoMsg(null);

      if (currentPlan.toUpperCase() === 'FREE') {
          // RESTRICTION FOR FREE USERS
          setErrorMsg('Ação Bloqueada: Você está no Plano Gratuito. Para comprar créditos adicionais, é necessário fazer um Upgrade para um Plano Pago.');
      } else {
          // SUCCESS FOR PAID USERS
          setSuccessMsg(`Pedido de ${pkgAmount} créditos iniciado! Redirecionando para checkout seguro...`);
          setTimeout(() => setSuccessMsg(null), 4000);
      }
  };

  // FILTER LOGIC: Hide Free plan if user is on a paid plan
  const currentTierOrder = planOrder[currentPlan.toUpperCase()] || 0;
  const filteredTiers = tiers.filter(tier => {
      const tierOrder = planOrder[tier.id.toUpperCase()] || 0;
      // If user is paid (order > 0), hide free plan (order 0)
      if (currentTierOrder > 0 && tierOrder === 0) return false;
      return true;
  });

  if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse flex justify-center">Carregando planos...</div>;

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* Header com Espaçamento e Hierarquia Melhorados */}
      <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-300 drop-shadow-sm">
          Planos e Potência
        </h1>
        <p className="text-xl text-slate-400 font-light leading-relaxed">
          Escolha o nível de acesso ideal para sua escala. <br/>
          O seu plano atual é o <span className="text-white font-semibold border-b border-primary/50">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1).toLowerCase()}</span>.
        </p>
      </div>

      {/* Feedback Alerts */}
      <div className="max-w-4xl mx-auto space-y-4 mb-12 sticky top-20 z-30">
          {errorMsg && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-500/30 text-red-200 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <AlertTitle className="text-red-400">Acesso Restrito</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
          {successMsg && (
            <Alert className="bg-green-950/50 border-green-500/30 text-green-200 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <AlertTitle className="text-green-400">Sucesso</AlertTitle>
                <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}
          {infoMsg && (
            <Alert className="bg-blue-950/50 border-blue-500/30 text-blue-200 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                <Zap className="h-5 w-5 text-blue-400" />
                <AlertTitle className="text-blue-400">Processando</AlertTitle>
                <AlertDescription>{infoMsg}</AlertDescription>
            </Alert>
          )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-32">
        {filteredTiers.map((tier) => {
            const btnState = getButtonState(tier.id);
            const Icon = tier.icon;
            const isCurrent = btnState === 'current';
            
            return (
                <Card 
                    key={tier.id} 
                    className={cn(
                        "relative flex flex-col transition-all duration-300 h-full border-2",
                        isCurrent 
                            ? "bg-surface border-primary shadow-[0_0_40px_rgba(0,167,225,0.15)] scale-[1.02] z-10" 
                            : "bg-surface/40 border-white/5 hover:border-white/10 hover:bg-surface/60"
                    )}
                >
                    {isCurrent && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-white border-none px-4 py-1 text-sm font-semibold shadow-xl">
                                Seu Plano Atual
                            </Badge>
                        </div>
                    )}
                    
                    <CardHeader className="text-center pb-6 pt-8">
                        <div className={cn("mx-auto p-4 rounded-2xl mb-4 w-fit bg-black/20 border border-white/5 shadow-inner", tier.color)}>
                            <Icon className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">{tier.name}</CardTitle>
                        <div className="pt-2 pb-2">
                            <span className="text-4xl font-bold text-white tracking-tight">{tier.price}</span>
                        </div>
                        <CardDescription className="text-sm text-slate-400 min-h-[40px] px-4">{tier.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 px-8">
                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full mb-6"></div>
                        <ul className="space-y-4">
                            {tier.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                    <div className="mt-0.5 rounded-full bg-green-500/10 p-0.5">
                                        <Check className="h-3 w-3 text-green-500 shrink-0" />
                                    </div>
                                    <span className="leading-tight">{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    
                    <CardFooter className="pt-6 pb-8 px-8">
                        <Button 
                            className={cn(
                                "w-full font-bold h-12 text-base shadow-lg transition-all", 
                                isCurrent 
                                    ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed" 
                                    : btnState === 'upgrade'
                                        ? "bg-primary hover:bg-primary-dark text-white shadow-primary/20 hover:scale-[1.02]"
                                        : "bg-surface hover:bg-surface/80 border border-white/10 text-slate-300"
                            )}
                            onClick={() => !isCurrent && handleAction(tier.name, btnState === 'upgrade' ? 'upgrade' : 'downgrade')}
                            disabled={isCurrent}
                        >
                            {isCurrent && "Plano Atual"}
                            {btnState === 'upgrade' && <span className="flex items-center">Fazer Upgrade <ArrowUp className="ml-2 h-4 w-4" /></span>}
                            {btnState === 'downgrade' && <span className="flex items-center">Fazer Downgrade <ArrowDown className="ml-2 h-4 w-4" /></span>}
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>

      {/* Credit Purchase Section - Highlighted */}
      <div className="max-w-5xl mx-auto">
          <div className="bg-surface/30 border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 relative z-10">
                  <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                      <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Pacotes de Créditos Avulsos</h3>
                      <p className="text-slate-400 text-base max-w-xl">
                          Precisa de mais potência este mês? Adicione créditos instantâneos à sua conta sem alterar sua assinatura recorrente.
                      </p>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                  {[
                      { amount: 500, price: 'R$ 30', label: 'Pack Básico' },
                      { amount: 1500, price: 'R$ 75', label: 'Melhor Valor', popular: true },
                      { amount: 4000, price: 'R$ 180', label: 'Pack Pro' }
                  ].map((pkg, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                            "group border rounded-2xl p-6 flex flex-col gap-4 cursor-pointer transition-all hover:-translate-y-1", 
                            pkg.popular 
                                ? "border-primary/30 bg-gradient-to-b from-primary/10 to-surface/50 hover:shadow-[0_0_20px_rgba(0,167,225,0.1)]" 
                                : "border-white/5 bg-black/20 hover:bg-black/40 hover:border-white/10"
                        )}
                        onClick={() => handleBuyCredits(pkg.amount)}
                      >
                          {pkg.popular && (
                              <div className="self-start bg-primary text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md mb-1">
                                  Mais Vendido
                              </div>
                          )}
                          
                          <div className="flex justify-between items-end">
                              <div>
                                <span className="text-3xl font-bold text-white">{pkg.amount}</span>
                                <span className="text-sm text-yellow-500 font-medium ml-1">Tokens</span>
                              </div>
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center group-hover:border-white/10 transition-colors">
                              <span className="text-xl font-semibold text-slate-200">{pkg.price}</span>
                              <Button size="sm" variant="ghost" className="h-9 text-xs hover:bg-white/10 text-primary hover:text-white">
                                  Comprar <Zap className="ml-1 h-3 w-3" />
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 bg-black/20 py-3 rounded-full w-fit mx-auto px-6 border border-white/5">
                 <Shield className="h-3 w-3 shrink-0" />
                 <p>Disponível apenas para assinantes ativos (Starter, Pro, Agency).</p>
              </div>
          </div>
      </div>

    </div>
  );
}
