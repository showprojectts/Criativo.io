
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../components/providers/AuthProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/Alert';
import { Check, Zap, Shield, AlertCircle, CheckCircle2, Box, Rocket, Crown, Star, ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

// --- CONFIGURAÇÃO DOS PLANOS ---
// IDs devem ser lowercase para facilitar comparação
interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  color: string;
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
  },
  {
    id: 'starter',
    name: "Starter",
    price: "R$ 97/mês",
    description: "Para criadores iniciantes.",
    features: ["500 Créditos Mensais", "Geração de Imagens", "Licença Comercial", "Suporte por Email"],
    icon: Rocket,
    color: "text-blue-400",
  },
  {
    id: 'pro',
    name: "Pro",
    price: "R$ 197/mês",
    description: "Para profissionais de marketing.",
    features: ["1.500 Créditos Mensais", "Acesso ao Modelo Banana", "Editor Mágico", "Suporte Prioritário", "Sem Marca D'água"],
    icon: Star,
    color: "text-primary",
  },
  {
    id: 'agency',
    name: "Agency",
    price: "R$ 497/mês",
    description: "Potência máxima para times.",
    features: ["4.000 Créditos Mensais", "Acesso ao Modelo Flow (4K)", "API Access", "Gerente Dedicado", "Múltiplos Usuários"],
    icon: Crown,
    color: "text-purple-400",
  }
];

// Ordem hierárquica para lógica de Upgrade/Downgrade
// CHAVES EM UPPERCASE PARA UNIFICAR
const planOrder: Record<string, number> = {
    'FREE': 0,
    'STARTER': 1, // Mapeado de BASIC
    'PRO': 2,
    'AGENCY': 3
};

export default function PlansPage() {
  const { user } = useAuth();
  
  // Estado do Plano Atual (Normalizado para coincidir com a UI: STARTER, FREE, PRO...)
  const [currentPlan, setCurrentPlan] = useState<string>('FREE'); 
  const [loading, setLoading] = useState(true);
  
  // Estado de Notificações
  const [notification, setNotification] = useState<{
      type: 'success' | 'error' | 'info';
      title: string;
      message: string;
  } | null>(null);

  // Normaliza o ID do plano vindo do banco para o ID da UI
  const normalizePlanId = (dbPlanId: string | null): string => {
      if (!dbPlanId) return 'FREE';
      const upper = dbPlanId.toUpperCase();
      // CORREÇÃO CRÍTICA: O banco retorna 'BASIC', a UI usa 'STARTER'
      if (upper === 'BASIC') return 'STARTER';
      return upper;
  };

  // Busca o plano real do usuário no Supabase
  useEffect(() => {
    async function fetchPlan() {
      if (!user) {
          setLoading(false);
          return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('plan_id')
          .eq('id', user.id)
          .single();
        
        // Normaliza para garantir que 'BASIC' vire 'STARTER'
        const normalized = normalizePlanId(data?.plan_id);
        setCurrentPlan(normalized);

      } catch (err) {
        console.error("Erro ao buscar plano:", err);
        setCurrentPlan('FREE');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [user]);

  // Lógica para determinar o estado do botão
  const getButtonState = (tierId: string) => {
      const tierIdUpper = tierId.toUpperCase(); // tierId vem como 'free', 'starter'
      
      const currentOrder = planOrder[currentPlan] || 0;
      const tierOrder = planOrder[tierIdUpper] || 0;

      if (currentPlan === tierIdUpper) return 'current'; // Match exato
      if (currentOrder > tierOrder) return 'downgrade';
      return 'upgrade';
  };

  // Handler para clique nos Planos
  const handlePlanAction = (tierName: string, action: 'upgrade' | 'downgrade') => {
      setNotification(null);
      setTimeout(() => {
          setNotification({
              type: 'info',
              title: 'Processando',
              message: `Iniciando fluxo de ${action === 'upgrade' ? 'Upgrade' : 'Downgrade'} para o plano ${tierName}...`
          });
      }, 200);
      setTimeout(() => setNotification(null), 4000);
  };

  // Handler para clique nos Créditos
  const handleCreditPurchase = (amount: number) => {
      setNotification(null);

      // REGRA DE NEGÓCIO: Free não compra crédito
      if (currentPlan === 'FREE') {
          setNotification({
              type: 'error',
              title: 'Ação Bloqueada',
              message: 'Você está no Plano Gratuito e não pode adquirir créditos avulsos. Faça um Upgrade para liberar essa função.'
          });
          return;
      }

      setNotification({
          type: 'success',
          title: 'Sucesso',
          message: `Pedido de ${amount} créditos iniciado! Redirecionando...`
      });
      setTimeout(() => setNotification(null), 4000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Cabeçalho */}
      <div className="text-center max-w-4xl mx-auto mb-20 space-y-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
          Planos e Potência
        </h1>
        <p className="text-xl text-slate-400">
          Escolha o nível de acesso ideal para sua escala.<br/>
          O seu plano atual é o <span className="text-white font-bold underline decoration-primary underline-offset-4">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1).toLowerCase()}</span>.
        </p>
      </div>

      {/* Área de Notificação */}
      <div className="fixed top-24 left-0 right-0 z-50 pointer-events-none px-4 flex justify-center">
          <div className="max-w-xl w-full pointer-events-auto">
            {notification && (
                <Alert className={cn(
                    "shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-5 duration-300",
                    notification.type === 'error' ? "bg-red-950/90 border-red-500/50 text-red-200" :
                    notification.type === 'success' ? "bg-green-950/90 border-green-500/50 text-green-200" :
                    "bg-blue-950/90 border-blue-500/50 text-blue-200"
                )}>
                    {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                    {notification.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    {notification.type === 'info' && <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
                    <div className="ml-2">
                        <AlertTitle className="font-bold text-lg">{notification.title}</AlertTitle>
                        <AlertDescription className="text-sm opacity-90">{notification.message}</AlertDescription>
                    </div>
                </Alert>
            )}
          </div>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto mb-32">
        {tiers.map((tier) => {
            const btnState = getButtonState(tier.id);
            const isCurrent = btnState === 'current';
            const isPro = tier.id === 'pro'; 
            const Icon = tier.icon;
            
            return (
                <Card 
                    key={tier.id} 
                    className={cn(
                        "relative flex flex-col h-full transition-all duration-300",
                        // Lógica Visual: Borda Azul se for Atual
                        isCurrent 
                            ? "bg-surface border-2 border-primary shadow-[0_0_30px_rgba(0,167,225,0.25)] z-10 scale-[1.03]" 
                            : "bg-surface/40 border-white/5 hover:border-white/20 hover:bg-surface/60"
                    )}
                >
                    {/* Badge "Seu Plano Atual" */}
                    {isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full text-center">
                            <Badge className="bg-primary text-white hover:bg-primary border-none px-4 py-1 text-xs font-bold shadow-lg uppercase tracking-wider">
                                Seu Plano Atual
                            </Badge>
                        </div>
                    )}

                    {/* Badge "Mais Vendido" */}
                    {isPro && !isCurrent && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full text-center">
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none px-3 py-0.5 text-[10px] font-bold shadow-lg uppercase">
                                Mais Vendido
                            </Badge>
                        </div>
                    )}
                    
                    <CardHeader className="text-center pb-6 pt-10">
                        <div className={cn("mx-auto p-3 rounded-xl mb-4 w-fit bg-black/30 border border-white/5", tier.color)}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl font-bold text-white">{tier.name}</CardTitle>
                        <div className="py-2">
                            <span className="text-3xl font-bold text-white tracking-tight">{tier.price}</span>
                        </div>
                        <p className="text-xs text-slate-400 px-2 min-h-[40px]">{tier.description}</p>
                    </CardHeader>
                    
                    <CardContent className="flex-1 px-6">
                        <div className="h-px bg-white/5 w-full mb-6"></div>
                        <ul className="space-y-3">
                            {tier.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                    <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    
                    <CardFooter className="pt-4 pb-8 px-6">
                        <Button 
                            className={cn(
                                "w-full font-bold h-10 text-sm shadow-md transition-all", 
                                // Lógica de Estilo do Botão
                                isCurrent 
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed hover:bg-slate-800 border border-white/5" // Botão Cinza
                                    : btnState === 'upgrade'
                                        ? "bg-primary hover:bg-primary-dark text-white hover:scale-[1.02]" // Botão Azul
                                        : "bg-transparent border border-white/20 text-white hover:bg-white/5" // Botão Outline
                            )}
                            onClick={() => !isCurrent && handlePlanAction(tier.name, btnState === 'upgrade' ? 'upgrade' : 'downgrade')}
                            disabled={isCurrent}
                        >
                            {isCurrent && "Plano Atual"}
                            {btnState === 'upgrade' && <span className="flex items-center">Fazer Upgrade <ArrowUp className="ml-2 h-3 w-3" /></span>}
                            {btnState === 'downgrade' && <span className="flex items-center">Fazer Downgrade <ArrowDown className="ml-2 h-3 w-3" /></span>}
                        </Button>
                    </CardFooter>
                </Card>
            )
        })}
      </div>

      {/* Seção de Créditos Avulsos */}
      <div className="max-w-5xl mx-auto">
          <div className="bg-surface/20 border border-white/5 rounded-3xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 relative z-10">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                          <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div>
                          <h3 className="text-2xl font-bold text-white">Créditos Avulsos</h3>
                          <p className="text-slate-400 text-sm">
                              Adicione potência extra sem mudar de plano.
                          </p>
                      </div>
                  </div>
                  
                  {/* Badge de Aviso se for FREE */}
                  {currentPlan === 'FREE' && (
                      <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg flex items-center gap-2 text-xs text-red-300 animate-pulse">
                          <Shield className="h-3 w-3" />
                          <span>Bloqueado para Plano Gratuito</span>
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                  {[
                      { amount: 500, price: 'R$ 30', label: 'Básico' },
                      { amount: 1500, price: 'R$ 75', label: 'Melhor Valor', popular: true },
                      { amount: 4000, price: 'R$ 180', label: 'Pro' }
                  ].map((pkg, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                            "group border rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden", 
                            pkg.popular 
                                ? "border-yellow-500/30 bg-gradient-to-b from-yellow-500/5 to-surface/50" 
                                : "border-white/5 bg-black/20 hover:bg-black/40 hover:border-white/10",
                            // Visual de bloqueado se for Free
                            currentPlan === 'FREE' && "opacity-60 grayscale hover:grayscale-0"
                        )}
                        onClick={() => handleCreditPurchase(pkg.amount)}
                      >
                          {pkg.popular && (
                              <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] uppercase font-bold px-2 py-0.5 rounded-bl-lg">
                                  Pop
                              </div>
                          )}
                          
                          <div className="flex justify-between items-baseline">
                              <span className="text-2xl font-bold text-white">{pkg.amount}</span>
                              <span className="text-xs text-slate-500">Tokens</span>
                          </div>
                          
                          <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center group-hover:border-white/10 transition-colors">
                              <span className="text-lg font-semibold text-slate-200">{pkg.price}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 text-[10px] hover:bg-white/10 text-primary hover:text-white uppercase tracking-wide"
                              >
                                  {currentPlan === 'FREE' ? 'Bloqueado' : 'Adquirir'}
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

    </div>
  );
}
