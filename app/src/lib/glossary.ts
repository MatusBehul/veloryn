/**
 * Financial Glossary System
 * Provides definitions for financial terms with categorization and search functionality
 */

export interface GlossaryTerm {
    id: string;
    translations: Record<string, {
        term: string;
        aliases?: string[]; // Alternative names for the term
        shortDefinition: string;
        fullDefinition: string;
        examples?: string[];
    }>
    category: GlossaryCategory;
    relatedTerms?: string[]; // IDs of related terms
    tags?: string[];
}

export type GlossaryCategory = 
  | 'fundamental_analysis'
  | 'technical_indicators'
  | 'trading_psychology'
  | 'general_finance'
  | 'market_metrics'
  | 'risk_management'
  | 'corporate_finance';

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, { name: string; description: string }> = {
  fundamental_analysis: {
    name: 'Fundamental Analysis',
    description: 'Analysis based on company financials and economic factors'
  },
  technical_indicators: {
    name: 'Technical Indicators',
    description: 'Mathematical calculations based on price and volume data'
  },
  trading_psychology: {
    name: 'Trading Psychology',
    description: 'Behavioral and psychological aspects of trading'
  },
  general_finance: {
    name: 'General Finance',
    description: 'Basic financial concepts and terminology'
  },
  market_metrics: {
    name: 'Market Metrics',
    description: 'Key performance indicators for stocks and markets'
  },
  risk_management: {
    name: 'Risk Management',
    description: 'Concepts related to managing investment risk'
  },
  corporate_finance: {
    name: 'Corporate Finance',
    description: 'Company financial structure and operations'
  }
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Fundamental Analysis
    {
        id: 'pe_ratio',
        category: 'fundamental_analysis',
        relatedTerms: ['eps', 'market_cap', 'valuation'],
        tags: ['valuation', 'earnings', 'ratio'],
        translations: {
            en: {
                examples: ['A P/E ratio of 15 means investors pay $15 for every $1 of annual earnings'],
                aliases: ['Price-to-Earnings Ratio', 'PE Ratio', 'Price Earnings Ratio', 'P/E'],
                term: 'P/E Ratio',
                shortDefinition: 'Price-to-earnings ratio measures how much investors pay per dollar of earnings.',
                fullDefinition: 'The Price-to-Earnings (P/E) ratio is a valuation metric that compares a company\'s current share price to its earnings per share (EPS). It indicates how much investors are willing to pay for each dollar of earnings. A higher P/E suggests investors expect higher earnings growth in the future.',       
            },
            sk: {
                examples: ['P/E pomer 15 znamená, že investori platia 15 USD za každý 1 USD ročného zisku'],
                aliases: ['Pomer ceny a zisku', 'P/E pomer', 'P/E'],
                term: 'P/E pomer',
                shortDefinition: 'Pomer ceny k zisku ukazuje, koľko sú investori ochotní zaplatiť za jeden dolár zisku.',
                fullDefinition: 'Pomer ceny k zisku (P/E) je ukazovateľ ocenenia, ktorý porovnáva aktuálnu cenu akcie so ziskom na akciu (EPS). Ukazuje, koľko sú investori ochotní zaplatiť za každý dolár zisku. Vyšší P/E naznačuje, že investori očakávajú vyšší rast ziskov v budúcnosti.',
            },
            cz: {
                examples: ['P/E poměr 15 znamená, že investoři platí 15 USD za každý 1 USD ročního zisku'],
                aliases: ['Poměr ceny a zisku', 'P/E poměr', 'P/E'],
                term: 'P/E poměr',
                shortDefinition: 'Poměr ceny k zisku ukazuje, kolik investoři platí za každý dolar zisku.',
                fullDefinition: 'Poměr ceny k zisku (P/E) je oceňovací ukazatel, který porovnává aktuální cenu akcie se ziskem na akcii (EPS). Ukazuje, kolik jsou investoři ochotni zaplatit za každý dolar zisku. Vyšší P/E naznačuje, že investoři očekávají vyšší růst zisků v budoucnu.',
            },
            es: {
                examples: ['Un P/E de 15 significa que los inversores pagan 15 USD por cada 1 USD de ganancias anuales'],
                aliases: ['Relación Precio-Beneficio', 'PER', 'Price to Earnings', 'P/E'],
                term: 'Relación P/E',
                shortDefinition: 'El ratio precio-beneficio mide cuánto pagan los inversores por cada dólar de beneficios.',
                fullDefinition: 'La Relación Precio-Beneficio (P/E) es un indicador de valoración que compara el precio actual de la acción con las ganancias por acción (EPS). Indica cuánto están dispuestos a pagar los inversores por cada dólar de beneficios. Un P/E más alto sugiere que los inversores esperan un mayor crecimiento de beneficios en el futuro.',
            },
            it: {
                examples: ['Un P/E di 15 significa che gli investitori pagano 15 USD per ogni 1 USD di utili annuali'],
                aliases: ['Rapporto Prezzo/Utili', 'Rapporto P/E', 'P/E'],
                term: 'Rapporto P/E',
                shortDefinition: 'Il rapporto prezzo/utili misura quanto pagano gli investitori per ogni dollaro di utili.',
                fullDefinition: 'Il rapporto Prezzo/Utili (P/E) è un indicatore di valutazione che confronta il prezzo attuale dell’azione con l’utile per azione (EPS). Indica quanto sono disposti a pagare gli investitori per ogni dollaro di utili. Un P/E più alto suggerisce che gli investitori si aspettano una crescita maggiore degli utili in futuro.',
            },
            de: {
                examples: ['Ein KGV von 15 bedeutet, dass Anleger 15 USD für jeden 1 USD Jahresgewinn zahlen'],
                aliases: ['Kurs-Gewinn-Verhältnis', 'KGV', 'P/E'],
                term: 'KGV',
                shortDefinition: 'Das Kurs-Gewinn-Verhältnis zeigt, wie viel Anleger pro Dollar Gewinn zahlen.',
                fullDefinition: 'Das Kurs-Gewinn-Verhältnis (KGV) ist eine Bewertungskennzahl, die den aktuellen Aktienkurs mit dem Gewinn je Aktie (EPS) vergleicht. Es zeigt, wie viel Anleger bereit sind, für jeden Dollar Gewinn zu zahlen. Ein höheres KGV deutet darauf hin, dass Anleger in Zukunft ein stärkeres Gewinnwachstum erwarten.',
            }
        }
    },
    {
        id: 'pb_ratio',
        category: 'fundamental_analysis',
        relatedTerms: ['book_value', 'valuation', 'pe_ratio', 'market_cap'],
        tags: ['valuation', 'ratio', 'book_value'],
        translations: {
            en: {
                examples: ['A P/B ratio of 1.5 means investors pay $1.50 for every $1 of book value.'],
                aliases: ['Price-to-Book Ratio', 'P/B Ratio', 'Price Book Ratio'],
                term: 'P/B Ratio',
                shortDefinition: 'Compares a company’s market value to its book value.',
                fullDefinition: 'The Price-to-Book (P/B) ratio compares a company’s market price per share to its book value per share (assets minus liabilities). A P/B above 1 indicates investors are paying more than the accounting value, while a P/B below 1 may suggest undervaluation or potential financial distress.',
            },
            sk: {
                examples: ['P/B pomer 1,5 znamená, že investori platia 1,50 USD za každý 1 USD účtovnej hodnoty.'],
                aliases: ['Pomer ceny k účtovnej hodnote', 'P/B pomer'],
                term: 'P/B pomer',
                shortDefinition: 'Porovnáva trhovú hodnotu spoločnosti s jej účtovnou hodnotou.',
                fullDefinition: 'Pomer ceny k účtovnej hodnote (P/B) porovnáva trhovú cenu akcie s účtovnou hodnotou na akciu (aktíva mínus pasíva). P/B nad 1 znamená, že investori platia viac ako je účtovná hodnota, zatiaľ čo P/B pod 1 môže naznačovať podhodnotenie alebo finančné problémy.',
            },
            cz: {
                examples: ['P/B poměr 1,5 znamená, že investoři platí 1,50 USD za každý 1 USD účetní hodnoty.'],
                aliases: ['Poměr ceny k účetní hodnotě', 'P/B poměr'],
                term: 'P/B poměr',
                shortDefinition: 'Porovnává tržní hodnotu společnosti s její účetní hodnotou.',
                fullDefinition: 'Poměr ceny k účetní hodnotě (P/B) porovnává tržní cenu akcie s účetní hodnotou na akcii (aktiva mínus pasiva). P/B nad 1 znamená, že investoři platí více než je účetní hodnota, zatímco P/B pod 1 může naznačovat podhodnocení nebo finanční potíže.',
            },
            es: {
                examples: ['Un P/B de 1,5 significa que los inversores pagan 1,50 USD por cada 1 USD de valor contable.'],
                aliases: ['Relación Precio-Valor en Libros', 'P/B', 'Price to Book'],
                term: 'Relación P/B',
                shortDefinition: 'Compara el valor de mercado de una empresa con su valor contable.',
                fullDefinition: 'La relación Precio-Valor en Libros (P/B) compara el precio de mercado por acción de una empresa con su valor contable por acción (activos menos pasivos). Un P/B superior a 1 indica que los inversores pagan más que el valor contable, mientras que un P/B inferior a 1 puede sugerir infravaloración o posibles problemas financieros.',
            },
            it: {
                examples: ['Un P/B di 1,5 significa che gli investitori pagano 1,50 USD per ogni 1 USD di valore contabile.'],
                aliases: ['Rapporto Prezzo/Valore Contabile', 'Rapporto P/B'],
                term: 'Rapporto P/B',
                shortDefinition: 'Confronta il valore di mercato di una società con il suo valore contabile.',
                fullDefinition: 'Il rapporto Prezzo/Valore Contabile (P/B) confronta il prezzo di mercato per azione con il valore contabile per azione (attività meno passività). Un P/B superiore a 1 indica che gli investitori pagano più del valore contabile, mentre un P/B inferiore a 1 può suggerire sottovalutazione o difficoltà finanziarie.',
            },
            de: {
                examples: ['Ein P/B von 1,5 bedeutet, dass Anleger 1,50 USD für jeden 1 USD Buchwert zahlen.'],
                aliases: ['Kurs-Buchwert-Verhältnis', 'KBV'],
                term: 'KBV',
                shortDefinition: 'Vergleicht den Marktwert eines Unternehmens mit seinem Buchwert.',
                fullDefinition: 'Das Kurs-Buchwert-Verhältnis (KBV) vergleicht den Marktpreis je Aktie mit dem Buchwert je Aktie (Aktiva minus Passiva). Ein KBV über 1 bedeutet, dass Anleger mehr als den Buchwert zahlen, während ein KBV unter 1 auf Unterbewertung oder finanzielle Probleme hindeuten kann.',
            }
        }
    },
    {
        id: 'eps',
        category: 'fundamental_analysis',
        relatedTerms: ['pe_ratio', 'net_income', 'outstanding_shares'],
        tags: ['earnings', 'profitability', 'per_share'],
        translations: {
            en: {
                examples: ['If a company earns $1M with 100K shares outstanding, EPS is $10'],
                aliases: ['Earnings Per Share'],
                term: 'EPS',
                shortDefinition: 'Earnings Per Share represents company profit divided by outstanding shares.',
                fullDefinition: 'Earnings Per Share (EPS) is calculated by dividing a company\'s net income by the number of outstanding shares. It represents the portion of company profit allocated to each share and is a key indicator of profitability.',
            },
            sk: {
                examples: ['Ak spoločnosť zarobí 1 milión USD a má 100 000 akcií v obehu, EPS je 10 USD'],
                aliases: ['Zisk na akciu'],
                term: 'EPS',
                shortDefinition: 'Zisk na akciu predstavuje podiel zisku spoločnosti na jednu akciu.',
                fullDefinition: 'Zisk na akciu (EPS) sa vypočíta vydelením čistého zisku spoločnosti počtom akcií v obehu. Predstavuje časť zisku pripadajúcu na jednu akciu a je kľúčovým ukazovateľom ziskovosti.',
            },
            cz: {
                examples: ['Pokud společnost vydělá 1 milion USD a má 100 000 akcií v oběhu, EPS je 10 USD'],
                aliases: ['Zisk na akcii'],
                term: 'EPS',
                shortDefinition: 'Zisk na akcii ukazuje podíl zisku společnosti připadající na jednu akcii.',
                fullDefinition: 'Zisk na akcii (EPS) se vypočítá vydělením čistého zisku společnosti počtem akcií v oběhu. Ukazuje část zisku připadající na jednu akcii a je klíčovým ukazatelem ziskovosti.',
            },
            es: {
                examples: ['Si una empresa gana 1 millón USD con 100 000 acciones en circulación, el EPS es 10 USD'],
                aliases: ['Beneficio por acción'],
                term: 'EPS',
                shortDefinition: 'El beneficio por acción representa la ganancia de la empresa dividida entre las acciones en circulación.',
                fullDefinition: 'El Beneficio por Acción (EPS) se calcula dividiendo el beneficio neto de la empresa entre el número de acciones en circulación. Representa la parte de las ganancias asignada a cada acción y es un indicador clave de rentabilidad.',
            },
            it: {
                examples: ['Se un’azienda guadagna 1 milione USD con 100.000 azioni in circolazione, l’EPS è 10 USD'],
                aliases: ['Utile per azione'],
                term: 'EPS',
                shortDefinition: 'L’utile per azione rappresenta il profitto della società diviso per il numero di azioni in circolazione.',
                fullDefinition: 'L’Utile per Azione (EPS) si calcola dividendo l’utile netto della società per il numero di azioni in circolazione. Indica la quota di utile attribuita a ciascuna azione ed è un indicatore chiave di redditività.',
            },
            de: {
                examples: ['Wenn ein Unternehmen 1 Mio. USD verdient und 100.000 Aktien im Umlauf hat, beträgt das EPS 10 USD'],
                aliases: ['Gewinn je Aktie'],
                term: 'EPS',
                shortDefinition: 'Der Gewinn je Aktie zeigt den Unternehmensgewinn pro ausgegebener Aktie.',
                fullDefinition: 'Der Gewinn je Aktie (EPS) wird berechnet, indem der Nettogewinn eines Unternehmens durch die Anzahl der ausgegebenen Aktien geteilt wird. Er zeigt den Gewinnanteil pro Aktie und ist ein wichtiger Indikator für die Rentabilität.',
            }
        }
    },
    {
        id: 'roe',
        category: 'fundamental_analysis',
        relatedTerms: ['net_income', 'shareholders_equity', 'profitability', 'roa'],
        tags: ['profitability', 'return', 'equity', 'ratio'],
        translations: {
            en: {
                examples: ['If net income is $200K and shareholders’ equity is $1M, ROE = 20%.'],
                aliases: ['Return on Equity'],
                term: 'ROE',
                shortDefinition: 'Measures profitability relative to shareholders’ equity.',
                fullDefinition: 'Return on Equity (ROE) shows how effectively a company generates profit from shareholders’ equity. It is calculated as Net Income divided by Shareholders’ Equity, expressed as a percentage. A higher ROE suggests efficient use of equity capital to drive profits.',
            },
            sk: {
                examples: ['Ak je čistý zisk 200 000 USD a vlastné imanie 1 milión USD, ROE = 20 %.'],
                aliases: ['Návratnosť vlastného kapitálu'],
                term: 'ROE',
                shortDefinition: 'Meria ziskovosť vo vzťahu k vlastnému kapitálu akcionárov.',
                fullDefinition: 'Návratnosť vlastného kapitálu (ROE) ukazuje, ako efektívne spoločnosť generuje zisk z vlastného imania akcionárov. Vypočíta sa ako čistý zisk delený vlastným imaním a vyjadruje sa v percentách. Vyššia hodnota ROE naznačuje efektívne využitie kapitálu na tvorbu ziskov.',
            },
            cz: {
                examples: ['Pokud je čistý zisk 200 000 USD a vlastní kapitál 1 milion USD, ROE = 20 %.'],
                aliases: ['Návratnost vlastního kapitálu'],
                term: 'ROE',
                shortDefinition: 'Měří ziskovost ve vztahu k vlastnímu kapitálu akcionářů.',
                fullDefinition: 'Návratnost vlastního kapitálu (ROE) ukazuje, jak efektivně společnost generuje zisk z vlastního kapitálu akcionářů. Vypočítá se jako čistý zisk dělený vlastním kapitálem a vyjadřuje se v procentech. Vyšší ROE znamená efektivnější využití kapitálu k tvorbě zisků.',
            },
            es: {
                examples: ['Si el beneficio neto es 200 000 USD y el patrimonio neto es 1 millón USD, el ROE = 20 %.'],
                aliases: ['Rentabilidad sobre recursos propios'],
                term: 'ROE',
                shortDefinition: 'Mide la rentabilidad en relación con el patrimonio de los accionistas.',
                fullDefinition: 'El Retorno sobre el Patrimonio (ROE) muestra cuán eficazmente una empresa genera beneficios a partir del patrimonio de los accionistas. Se calcula como beneficio neto dividido entre patrimonio neto y se expresa en porcentaje. Un ROE más alto indica un uso eficiente del capital propio para generar ganancias.',
            },
            it: {
                examples: ['Se l’utile netto è 200.000 USD e il patrimonio netto è 1 milione USD, il ROE = 20 %.'],
                aliases: ['Redditività del capitale proprio', 'Return on Equity'],
                term: 'ROE',
                shortDefinition: 'Misura la redditività rispetto al capitale proprio degli azionisti.',
                fullDefinition: 'Il Return on Equity (ROE) mostra quanto efficacemente un’azienda genera profitti dal capitale proprio degli azionisti. Si calcola come utile netto diviso per patrimonio netto ed è espresso in percentuale. Un ROE più alto suggerisce un uso efficiente del capitale proprio per produrre utili.',
            },
            de: {
                examples: ['Wenn der Nettogewinn 200.000 USD und das Eigenkapital 1 Mio. USD beträgt, ergibt sich ein ROE von 20 %.'],
                aliases: ['Eigenkapitalrendite'],
                term: 'ROE',
                shortDefinition: 'Misst die Rentabilität im Verhältnis zum Eigenkapital der Aktionäre.',
                fullDefinition: 'Die Eigenkapitalrendite (ROE) zeigt, wie effektiv ein Unternehmen Gewinne aus dem Eigenkapital der Aktionäre erzielt. Sie wird berechnet als Nettogewinn geteilt durch Eigenkapital und in Prozent ausgedrückt. Ein höheres ROE deutet auf eine effiziente Nutzung des Eigenkapitals hin, um Gewinne zu erwirtschaften.',
            }
        }
    },
    {
        id: 'roa',
        category: 'fundamental_analysis',
        relatedTerms: ['net_income', 'assets', 'profitability', 'roe'],
        tags: ['profitability', 'return', 'assets', 'ratio'],
        translations: {
            en: {
                examples: ['If net income is $150K and total assets are $3M, ROA = 5%.'],
                aliases: ['Return on Assets'],
                term: 'ROA',
                shortDefinition: 'Measures how efficiently a company uses its assets to generate profit.',
                fullDefinition: 'Return on Assets (ROA) is calculated by dividing net income by total assets. It shows how effectively a company converts its assets into earnings. A higher ROA indicates more efficient use of assets, while a lower ROA may suggest inefficiency or heavy reliance on debt.',
            },
            sk: {
                examples: ['Ak je čistý zisk 150 000 USD a celkové aktíva 3 milióny USD, ROA = 5 %.'],
                aliases: ['Návratnosť aktív'],
                term: 'ROA',
                shortDefinition: 'Meria, ako efektívne spoločnosť využíva svoje aktíva na generovanie zisku.',
                fullDefinition: 'Návratnosť aktív (ROA) sa vypočíta ako čistý zisk delený celkovými aktívami. Ukazuje, ako efektívne spoločnosť premieňa aktíva na zisk. Vyššia ROA znamená efektívnejšie využívanie aktív, zatiaľ čo nižšia ROA môže naznačovať neefektívnosť alebo vysokú závislosť od dlhu.',
            },
            cz: {
                examples: ['Pokud je čistý zisk 150 000 USD a celková aktiva 3 miliony USD, ROA = 5 %.'],
                aliases: ['Návratnost aktiv'],
                term: 'ROA',
                shortDefinition: 'Měří, jak efektivně společnost využívá svá aktiva k tvorbě zisku.',
                fullDefinition: 'Návratnost aktiv (ROA) se vypočítá jako čistý zisk dělený celkovými aktivy. Ukazuje, jak efektivně společnost přeměňuje aktiva na zisk. Vyšší ROA znamená efektivnější využití aktiv, zatímco nižší ROA může znamenat neefektivnost nebo vysokou závislost na dluhu.',
            },
            es: {
                examples: ['Si el beneficio neto es 150 000 USD y los activos totales son 3 millones USD, el ROA = 5 %.'],
                aliases: ['Rentabilidad sobre activos'],
                term: 'ROA',
                shortDefinition: 'Mide qué tan eficientemente una empresa utiliza sus activos para generar beneficios.',
                fullDefinition: 'El Retorno sobre Activos (ROA) se calcula dividiendo el beneficio neto entre los activos totales. Muestra qué tan bien una empresa convierte sus activos en ganancias. Un ROA más alto indica un uso más eficiente de los activos, mientras que un ROA bajo puede sugerir ineficiencia o alta dependencia de la deuda.',
            },
            it: {
                examples: ['Se l’utile netto è 150.000 USD e le attività totali sono 3 milioni USD, il ROA = 5 %.'],
                aliases: ['Redditività degli attivi'],
                term: 'ROA',
                shortDefinition: 'Misura l’efficienza con cui un’azienda utilizza i propri attivi per generare utili.',
                fullDefinition: 'Il Return on Assets (ROA) si calcola dividendo l’utile netto per il totale delle attività. Mostra quanto efficacemente un’azienda trasforma gli attivi in profitti. Un ROA più elevato indica un uso più efficiente degli attivi, mentre un ROA basso può suggerire inefficienza o forte dipendenza dal debito.',
            },
            de: {
                examples: ['Wenn der Nettogewinn 150.000 USD und die Gesamtvermögenswerte 3 Mio. USD betragen, ergibt sich ein ROA von 5 %.'],
                aliases: ['Gesamtkapitalrendite'],
                term: 'ROA',
                shortDefinition: 'Misst, wie effizient ein Unternehmen seine Vermögenswerte zur Gewinnerzielung nutzt.',
                fullDefinition: 'Die Gesamtkapitalrendite (ROA) wird berechnet, indem der Nettogewinn durch die Gesamtvermögenswerte geteilt wird. Sie zeigt, wie effektiv ein Unternehmen seine Vermögenswerte in Gewinne umwandelt. Ein höherer ROA weist auf eine effizientere Nutzung der Vermögenswerte hin, während ein niedriger ROA auf Ineffizienz oder starke Verschuldung hindeuten kann.',
            }
        }
    },
    {
        id: 'roi',
        category: 'fundamental_analysis',
        relatedTerms: ['profitability', 'investment', 'roe', 'roa'],
        tags: ['profitability', 'return', 'investment', 'ratio'],
        translations: {
            en: {
                examples: ['If you invest $1,000 and make $1,200 back, ROI = (1,200 − 1,000) / 1,000 = 20%.'],
                aliases: ['Return on Investment'],
                term: 'ROI',
                shortDefinition: 'Measures gain or loss relative to the amount invested.',
                fullDefinition: 'Return on Investment (ROI) is a profitability ratio that measures the gain or loss from an investment relative to its cost. It is calculated as (Profit − Cost) ÷ Cost and expressed as a percentage. ROI helps compare the efficiency of different investments or projects.',
            },
            sk: {
                examples: ['Ak investujete 1 000 USD a získate späť 1 200 USD, ROI = (1 200 − 1 000) / 1 000 = 20 %.'],
                aliases: ['Návratnosť investícií'],
                term: 'ROI',
                shortDefinition: 'Meria zisk alebo stratu vo vzťahu k investovanej sume.',
                fullDefinition: 'Návratnosť investícií (ROI) je ukazovateľ ziskovosti, ktorý meria zisk alebo stratu z investície vzhľadom na jej náklady. Vypočíta sa ako (Zisk − Náklady) ÷ Náklady a vyjadruje sa v percentách. ROI pomáha porovnávať efektívnosť rôznych investícií alebo projektov.',
            },
            cz: {
                examples: ['Pokud investujete 1 000 USD a získáte zpět 1 200 USD, ROI = (1 200 − 1 000) / 1 000 = 20 %.'],
                aliases: ['Návratnost investic'],
                term: 'ROI',
                shortDefinition: 'Měří zisk nebo ztrátu ve vztahu k investované částce.',
                fullDefinition: 'Návratnost investic (ROI) je ukazatel ziskovosti, který měří zisk nebo ztrátu z investice vzhledem k jejím nákladům. Vypočítá se jako (Zisk − Náklady) ÷ Náklady a vyjadřuje se v procentech. ROI pomáhá porovnávat efektivitu různých investic nebo projektů.',
            },
            es: {
                examples: ['Si inviertes 1 000 USD y recuperas 1 200 USD, el ROI = (1 200 − 1 000) / 1 000 = 20 %.'],
                aliases: ['Retorno sobre la inversión'],
                term: 'ROI',
                shortDefinition: 'Mide la ganancia o pérdida en relación con la cantidad invertida.',
                fullDefinition: 'El Retorno sobre la Inversión (ROI) es un indicador de rentabilidad que mide la ganancia o pérdida de una inversión en relación con su coste. Se calcula como (Beneficio − Coste) ÷ Coste y se expresa en porcentaje. El ROI ayuda a comparar la eficiencia de distintas inversiones o proyectos.',
            },
            it: {
                examples: ['Se investi 1.000 USD e ottieni 1.200 USD, il ROI = (1.200 − 1.000) / 1.000 = 20 %.'],
                aliases: ['Rendimento dell’investimento'],
                term: 'ROI',
                shortDefinition: 'Misura il guadagno o la perdita rispetto all’importo investito.',
                fullDefinition: 'Il Return on Investment (ROI) è un indicatore di redditività che misura il guadagno o la perdita di un investimento rispetto al suo costo. Si calcola come (Profitto − Costo) ÷ Costo ed è espresso in percentuale. Il ROI aiuta a confrontare l’efficienza di diversi investimenti o progetti.',
            },
            de: {
                examples: ['Wenn Sie 1.000 USD investieren und 1.200 USD zurückbekommen, ergibt sich ROI = (1.200 − 1.000) / 1.000 = 20 %.'],
                aliases: ['Kapitalrendite', 'Return on Investment'],
                term: 'ROI',
                shortDefinition: 'Misst Gewinn oder Verlust im Verhältnis zum investierten Betrag.',
                fullDefinition: 'Die Kapitalrendite (ROI) ist eine Rentabilitätskennzahl, die den Gewinn oder Verlust einer Investition im Verhältnis zu ihren Kosten misst. Sie wird berechnet als (Gewinn − Kosten) ÷ Kosten und in Prozent angegeben. ROI dient zum Vergleich der Effizienz verschiedener Investitionen oder Projekte.',
            }
        }
    },
    {
        id: 'market_cap',
        category: 'market_metrics',
        relatedTerms: ['outstanding_shares', 'stock_price'],
        tags: ['valuation', 'company_size', 'shares'],
        translations: {
            en: {
                examples: ['A company with 1M shares at $50/share has a $50M market cap'],
                aliases: ['Market Cap', 'Market Value'],
                term: 'Market Capitalization',
                shortDefinition: 'Total value of a company\'s shares in the stock market.',
                fullDefinition: 'Market Capitalization is the total dollar market value of a company\'s outstanding shares. It\'s calculated by multiplying the current stock price by the number of outstanding shares. Market cap is used to categorize companies as small-cap, mid-cap, or large-cap.',
            },
            sk: {
                examples: ['Spoločnosť s 1 miliónom akcií pri cene 50 USD má trhovú kapitalizáciu 50 miliónov USD'],
                aliases: ['Trhová kapitalizácia', 'Trhová hodnota'],
                term: 'Trhová kapitalizácia',
                shortDefinition: 'Celková hodnota akcií spoločnosti na burze.',
                fullDefinition: 'Trhová kapitalizácia je celková trhová hodnota všetkých akcií spoločnosti v obehu. Vypočíta sa vynásobením aktuálnej ceny akcie počtom akcií v obehu. Používa sa na kategorizáciu spoločností na small-cap, mid-cap alebo large-cap.',
            },
            cz: {
                examples: ['Společnost s 1 milionem akcií při ceně 50 USD má tržní kapitalizaci 50 milionů USD'],
                aliases: ['Tržní kapitalizace', 'Tržní hodnota'],
                term: 'Tržní kapitalizace',
                shortDefinition: 'Celková hodnota akcií společnosti na trhu.',
                fullDefinition: 'Tržní kapitalizace je celková tržní hodnota všech akcií společnosti v oběhu. Vypočítá se jako aktuální cena akcie krát počet akcií v oběhu. Používá se k rozdělení společností na small-cap, mid-cap nebo large-cap.',
            },
            es: {
                examples: ['Una empresa con 1 millón de acciones a 50 USD/acción tiene una capitalización bursátil de 50 millones USD'],
                aliases: ['Capitalización bursátil', 'Valor de mercado'],
                term: 'Capitalización bursátil',
                shortDefinition: 'Valor total de las acciones de una empresa en el mercado.',
                fullDefinition: 'La capitalización bursátil es el valor total de mercado de todas las acciones en circulación de una empresa. Se calcula multiplicando el precio actual de la acción por el número de acciones en circulación. Se utiliza para clasificar empresas en small-cap, mid-cap o large-cap.',
            },
            it: {
                examples: ['Un’azienda con 1 milione di azioni a 50 USD per azione ha una capitalizzazione di mercato di 50 milioni USD'],
                aliases: ['Capitalizzazione di mercato', 'Valore di mercato'],
                term: 'Capitalizzazione di mercato',
                shortDefinition: 'Valore totale delle azioni di una società sul mercato.',
                fullDefinition: 'La capitalizzazione di mercato è il valore complessivo di tutte le azioni in circolazione di una società. Si calcola moltiplicando il prezzo corrente dell’azione per il numero di azioni in circolazione. È utilizzata per classificare le aziende come small-cap, mid-cap o large-cap.',
            },
            de: {
                examples: ['Ein Unternehmen mit 1 Mio. Aktien zu je 50 USD hat eine Marktkapitalisierung von 50 Mio. USD'],
                aliases: ['Marktkapitalisierung', 'Marktwert'],
                term: 'Marktkapitalisierung',
                shortDefinition: 'Gesamtwert aller Aktien eines Unternehmens am Markt.',
                fullDefinition: 'Die Marktkapitalisierung ist der gesamte Marktwert aller im Umlauf befindlichen Aktien eines Unternehmens. Sie wird berechnet, indem der aktuelle Aktienkurs mit der Anzahl der ausgegebenen Aktien multipliziert wird. Sie dient zur Einteilung von Unternehmen in Small-Cap, Mid-Cap oder Large-Cap.',
            }
        }
    },
    {
        id: 'dividend_yield',
        category: 'fundamental_analysis',
        relatedTerms: ['dividend', 'stock_price', 'income_investing'],
        tags: ['dividends', 'income', 'yield', 'percentage'],
        translations: {
            en: {
                examples: ['A $100 stock paying $4 annual dividends has a 4% yield'],
                aliases: ['Yield'],
                term: 'Dividend Yield',
                shortDefinition: 'Annual dividend payments as a percentage of stock price.',
                fullDefinition: 'Dividend Yield is calculated by dividing annual dividend payments by the current stock price. It represents the income return on investment and is expressed as a percentage. Higher yields may indicate undervalued stocks or companies in declining industries.',
            },
            sk: {
                examples: ['Akcia s cenou 100 USD, ktorá vypláca 4 USD ročne na dividendách, má výnos 4 %'],
                aliases: ['Výnos'],
                term: 'Dividendový výnos',
                shortDefinition: 'Ročné dividendy vyjadrené ako percento ceny akcie.',
                fullDefinition: 'Dividendový výnos sa vypočíta vydelením ročných dividend aktuálnou cenou akcie. Predstavuje výnos z investície v podobe príjmu a vyjadruje sa v percentách. Vyšší výnos môže naznačovať podhodnotené akcie alebo spoločnosti v úpadkových odvetviach.',
            },
            cz: {
                examples: ['Akcie s cenou 100 USD, která vyplácí 4 USD ročně na dividendách, má výnos 4 %'],
                aliases: ['Výnos'],
                term: 'Dividendový výnos',
                shortDefinition: 'Roční dividendy vyjádřené jako procento ceny akcie.',
                fullDefinition: 'Dividendový výnos se vypočítá vydělením ročních dividend aktuální cenou akcie. Ukazuje příjmový výnos z investice a vyjadřuje se v procentech. Vyšší výnos může signalizovat podhodnocené akcie nebo společnosti v upadajících odvětvích.',
            },
            es: {
                examples: ['Una acción de 100 USD que paga 4 USD anuales en dividendos tiene un rendimiento del 4 %'],
                aliases: ['Rendimiento'],
                term: 'Rendimiento por dividendo',
                shortDefinition: 'Dividendos anuales expresados como porcentaje del precio de la acción.',
                fullDefinition: 'El rendimiento por dividendo se calcula dividiendo los dividendos anuales entre el precio actual de la acción. Representa el retorno de ingresos de la inversión y se expresa en porcentaje. Un mayor rendimiento puede indicar acciones infravaloradas o empresas en sectores en declive.',
            },
            it: {
                examples: ['Un’azione da 100 USD che paga 4 USD all’anno di dividendi ha un rendimento del 4 %'],
                aliases: ['Rendimento'],
                term: 'Rendimento da dividendo',
                shortDefinition: 'Dividendi annuali espressi come percentuale del prezzo dell’azione.',
                fullDefinition: 'Il rendimento da dividendo si calcola dividendo i dividendi annuali per il prezzo attuale dell’azione. Rappresenta il ritorno sul capitale investito sotto forma di reddito ed è espresso in percentuale. Un rendimento più elevato può indicare azioni sottovalutate o aziende in settori in declino.',
            },
            de: {
                examples: ['Eine Aktie zu 100 USD, die 4 USD Jahresdividende zahlt, hat eine Dividendenrendite von 4 %'],
                aliases: ['Rendite'],
                term: 'Dividendenrendite',
                shortDefinition: 'Jährliche Dividendenzahlungen als Prozentsatz des Aktienkurses.',
                fullDefinition: 'Die Dividendenrendite wird berechnet, indem die jährlichen Dividenden durch den aktuellen Aktienkurs geteilt werden. Sie zeigt die Einkommensrendite einer Investition und wird in Prozent ausgedrückt. Eine höhere Rendite kann auf unterbewertete Aktien oder Unternehmen in schrumpfenden Branchen hinweisen.',
            }
        }
    },

    // Technical Indicators
    {
        id: 'rsi',
        category: 'technical_indicators',
        relatedTerms: ['momentum', 'overbought', 'oversold', 'oscillator'],
        tags: ['momentum', 'oscillator', 'overbought', 'oversold'],
        translations: {
            en: {
                examples: ['RSI of 75 suggests the stock may be overbought and due for a pullback'],
                aliases: ['Relative Strength Index'],
                term: 'RSI',
                shortDefinition: 'Relative Strength Index measures overbought/oversold conditions.',
                fullDefinition: 'The Relative Strength Index (RSI) is a momentum oscillator that ranges from 0 to 100. It measures the speed and magnitude of recent price changes. RSI above 70 typically indicates overbought conditions, while RSI below 30 suggests oversold conditions.',
            },
            sk: {
                examples: ['RSI na úrovni 75 naznačuje, že akcia môže byť prekúpená a hrozí pokles'],
                aliases: ['Index relatívnej sily'],
                term: 'RSI',
                shortDefinition: 'Index relatívnej sily meria prekúpenosť alebo prepredanosť trhu.',
                fullDefinition: 'Index relatívnej sily (RSI) je momentový oscilátor v rozmedzí od 0 do 100. Meria rýchlosť a rozsah nedávnych cenových zmien. RSI nad 70 zvyčajne signalizuje prekúpené podmienky, RSI pod 30 naopak prepredané podmienky.',
            },
            cz: {
                examples: ['RSI na hodnotě 75 naznačuje, že akcie může být překoupená a hrozí pokles'],
                aliases: ['Index relativní síly'],
                term: 'RSI',
                shortDefinition: 'Index relativní síly měří překoupené nebo přeprodané podmínky.',
                fullDefinition: 'Index relativní síly (RSI) je momentový oscilátor v rozmezí 0 až 100. Měří rychlost a rozsah nedávných cenových změn. RSI nad 70 obvykle signalizuje překoupený trh, RSI pod 30 přeprodaný trh.',
            },
            es: {
                examples: ['Un RSI de 75 sugiere que la acción puede estar sobrecomprada y lista para una corrección'],
                aliases: ['Índice de Fuerza Relativa'],
                term: 'RSI',
                shortDefinition: 'El Índice de Fuerza Relativa mide condiciones de sobrecompra o sobreventa.',
                fullDefinition: 'El Índice de Fuerza Relativa (RSI) es un oscilador de momento que varía entre 0 y 100. Mide la velocidad y magnitud de los cambios recientes en el precio. Un RSI por encima de 70 indica sobrecompra, mientras que por debajo de 30 indica sobreventa.',
            },
            it: {
                examples: ['Un RSI di 75 suggerisce che il titolo potrebbe essere in ipercomprato e soggetto a correzione'],
                aliases: ['Indice di Forza Relativa'],
                term: 'RSI',
                shortDefinition: 'L’Indice di Forza Relativa misura condizioni di ipercomprato o ipervenduto.',
                fullDefinition: 'L’Indice di Forza Relativa (RSI) è un oscillatore di momentum che varia da 0 a 100. Misura la velocità e l’ampiezza delle variazioni recenti di prezzo. Un RSI superiore a 70 indica generalmente ipercomprato, mentre sotto 30 indica ipervenduto.',
            },
            de: {
                examples: ['Ein RSI von 75 deutet darauf hin, dass die Aktie überkauft sein könnte und eine Korrektur bevorsteht'],
                aliases: ['Relative-Stärke-Index'],
                term: 'RSI',
                shortDefinition: 'Der Relative-Stärke-Index misst überkaufte oder überverkaufte Marktbedingungen.',
                fullDefinition: 'Der Relative-Stärke-Index (RSI) ist ein Momentum-Oszillator im Bereich von 0 bis 100. Er misst die Geschwindigkeit und das Ausmaß jüngster Kursveränderungen. Ein RSI über 70 signalisiert typischerweise Überkauftheit, ein RSI unter 30 Überverkauftheit.',
            }
        }
    },
    {
        id: 'macd',
        category: 'technical_indicators',
        relatedTerms: ['moving_average', 'trend', 'momentum', 'signal_line'],
        tags: ['trend', 'momentum', 'moving_average', 'crossover'],
        translations: {
            en: {
                examples: ['MACD crossing above signal line often suggests upward momentum'],
                aliases: ['Moving Average Convergence Divergence'],
                term: 'MACD',
                shortDefinition: 'Moving Average Convergence Divergence identifies trend changes.',
                fullDefinition: 'MACD is a trend-following momentum indicator that shows the relationship between two moving averages. It consists of the MACD line, signal line, and histogram. When the MACD line crosses above the signal line, it may indicate a bullish signal.',
            },
            sk: {
                examples: ['Prienik MACD nad signálnu líniu často naznačuje rastúci trend'],
                aliases: ['Kĺzavý priemer konvergencia/divergencia'],
                term: 'MACD',
                shortDefinition: 'MACD identifikuje zmeny trendov pomocou kĺzavých priemerov.',
                fullDefinition: 'MACD je momentový indikátor sledujúci trend, ktorý ukazuje vzťah medzi dvomi kĺzavými priemermi. Pozostáva z línie MACD, signálnej línie a histogramu. Keď línia MACD pretne signálnu líniu smerom nahor, môže to signalizovať býčí trend.',
            },
            cz: {
                examples: ['Průnik MACD nad signální linii často naznačuje rostoucí trend'],
                aliases: ['Klouzavý průměr konvergence/divergence'],
                term: 'MACD',
                shortDefinition: 'MACD identifikuje změny trendu pomocí klouzavých průměrů.',
                fullDefinition: 'MACD je momentový indikátor sledující trend, který ukazuje vztah mezi dvěma klouzavými průměry. Skládá se z linie MACD, signální linie a histogramu. Pokud linie MACD překříží signální linii směrem vzhůru, může to znamenat býčí signál.',
            },
            es: {
                examples: ['El cruce del MACD por encima de la línea de señal suele sugerir un impulso alcista'],
                aliases: ['Media Móvil de Convergencia/Divergencia'],
                term: 'MACD',
                shortDefinition: 'El MACD identifica cambios de tendencia mediante medias móviles.',
                fullDefinition: 'El MACD es un indicador de momento seguidor de tendencias que muestra la relación entre dos medias móviles. Consta de la línea MACD, la línea de señal y el histograma. Cuando la línea MACD cruza por encima de la línea de señal, puede indicar una señal alcista.',
            },
            it: {
                examples: ['L’incrocio del MACD sopra la linea di segnale spesso suggerisce un trend rialzista'],
                aliases: ['Media Mobile di Convergenza/Divergenza'],
                term: 'MACD',
                shortDefinition: 'Il MACD identifica cambiamenti di trend tramite medie mobili.',
                fullDefinition: 'Il MACD è un indicatore di momentum basato sul trend che mostra la relazione tra due medie mobili. È composto dalla linea MACD, dalla linea di segnale e dall’istogramma. Quando la linea MACD incrocia verso l’alto la linea di segnale, può indicare un segnale rialzista.',
            },
            de: {
                examples: ['Ein MACD, der über die Signallinie kreuzt, deutet oft auf Aufwärtsmomentum hin'],
                aliases: ['Gleitender-Durchschnitts-Konvergenz/Divergenz'],
                term: 'MACD',
                shortDefinition: 'MACD identifiziert Trendänderungen anhand gleitender Durchschnitte.',
                fullDefinition: 'Der MACD ist ein trendfolgender Momentum-Indikator, der die Beziehung zwischen zwei gleitenden Durchschnitten zeigt. Er besteht aus der MACD-Linie, der Signallinie und dem Histogramm. Wenn die MACD-Linie die Signallinie nach oben kreuzt, kann dies ein bullisches Signal sein.',
            }
        }
    },
    {
        id: 'bollinger_bands',
        category: 'technical_indicators',
        relatedTerms: ['moving_average', 'standard_deviation', 'volatility', 'support_resistance'],
        tags: ['volatility', 'channels', 'standard_deviation', 'overbought_oversold'],
        translations: {
            en: {
                examples: ['Price touching upper Bollinger Band may indicate overbought conditions'],
                aliases: ['BB'],
                term: 'Bollinger Bands',
                shortDefinition: 'Price channels based on moving averages and standard deviation.',
                fullDefinition: 'Bollinger Bands consist of three lines: a middle band (usually 20-period moving average) and upper/lower bands set at two standard deviations away. They help identify overbought/oversold conditions and potential breakouts.',
            },
            sk: {
                examples: ['Ak cena dosiahne horné Bollingerovo pásmo, môže to signalizovať prekúpené podmienky'],
                aliases: ['BB'],
                term: 'Bollingerove pásma',
                shortDefinition: 'Cenové kanály založené na kĺzavom priemere a štandardnej odchýlke.',
                fullDefinition: 'Bollingerove pásma pozostávajú z troch čiar: stredného pásma (zvyčajne 20-dňový kĺzavý priemer) a horného/spodného pásma vzdialeného dve štandardné odchýlky. Pomáhajú identifikovať prekúpené alebo prepredané podmienky a možné prierazy.',
            },
            cz: {
                examples: ['Pokud cena dosáhne horního Bollingerova pásma, může to signalizovat překoupené podmínky'],
                aliases: ['BB'],
                term: 'Bollingerova pásma',
                shortDefinition: 'Cenové kanály založené na klouzavém průměru a směrodatné odchylce.',
                fullDefinition: 'Bollingerova pásma se skládají ze tří linií: středního pásma (obvykle 20denní klouzavý průměr) a horního/spodního pásma vzdáleného dvě směrodatné odchylky. Slouží k identifikaci překoupených nebo přeprodaných podmínek a možných proražení.',
            },
            es: {
                examples: ['Si el precio toca la banda superior de Bollinger, puede indicar condiciones de sobrecompra'],
                aliases: ['BB'],
                term: 'Bandas de Bollinger',
                shortDefinition: 'Canales de precios basados en medias móviles y desviación estándar.',
                fullDefinition: 'Las Bandas de Bollinger constan de tres líneas: una banda central (normalmente una media móvil de 20 periodos) y bandas superior e inferior situadas a dos desviaciones estándar. Ayudan a identificar condiciones de sobrecompra/sobreventa y posibles rupturas.',
            },
            it: {
                examples: ['Se il prezzo tocca la banda superiore di Bollinger, può indicare una condizione di ipercomprato'],
                aliases: ['BB'],
                term: 'Bande di Bollinger',
                shortDefinition: 'Canali di prezzo basati su medie mobili e deviazione standard.',
                fullDefinition: 'Le Bande di Bollinger sono composte da tre linee: una banda centrale (di solito la media mobile a 20 periodi) e bande superiore/inferiore poste a due deviazioni standard. Aiutano a identificare condizioni di ipercomprato/ipervenduto e possibili breakout.',
            },
            de: {
                examples: ['Wenn der Kurs das obere Bollinger-Band berührt, kann dies auf überkaufte Bedingungen hindeuten'],
                aliases: ['BB'],
                term: 'Bollinger-Bänder',
                shortDefinition: 'Kurskanäle basierend auf gleitendem Durchschnitt und Standardabweichung.',
                fullDefinition: 'Bollinger-Bänder bestehen aus drei Linien: einem mittleren Band (meist ein 20-Tage gleitender Durchschnitt) und oberen/unteren Bändern, die zwei Standardabweichungen entfernt sind. Sie helfen, überkaufte oder überverkaufte Bedingungen und mögliche Ausbrüche zu erkennen.',
            }
        }
    },
    {
        id: 'moving_average',
        category: 'technical_indicators',
        relatedTerms: ['trend', 'support_resistance', 'price_action'],
        tags: ['trend', 'smoothing', 'average', 'support_resistance'],
        translations: {
            en: {
                examples: ['20-day moving average shows the average closing price over the last 20 days'],
                aliases: ['MA', 'SMA', 'EMA'],
                term: 'Moving Average',
                shortDefinition: 'Average price over a specific time period, updated continuously.',
                fullDefinition: 'A Moving Average smooths price data by creating a constantly updated average price over a specific time period. Common types include Simple Moving Average (SMA) and Exponential Moving Average (EMA). They help identify trends and support/resistance levels.',
            },
            sk: {
                examples: ['20-dňový kĺzavý priemer ukazuje priemernú záverečnú cenu za posledných 20 dní'],
                aliases: ['MA', 'SMA', 'EMA'],
                term: 'Kĺzavý priemer',
                shortDefinition: 'Priemerná cena za určité obdobie, priebežne aktualizovaná.',
                fullDefinition: 'Kĺzavý priemer vyhladzuje cenové dáta tým, že vytvára neustále aktualizovaný priemer za určité obdobie. Medzi bežné typy patria jednoduchý kĺzavý priemer (SMA) a exponenciálny kĺzavý priemer (EMA). Pomáha identifikovať trendy a úrovne podpory/rezistencie.',
            },
            cz: {
                examples: ['20denní klouzavý průměr ukazuje průměrnou závěrečnou cenu za posledních 20 dní'],
                aliases: ['MA', 'SMA', 'EMA'],
                term: 'Klouzavý průměr',
                shortDefinition: 'Průměrná cena za určité období, průběžně aktualizovaná.',
                fullDefinition: 'Klouzavý průměr vyhlazuje cenová data tím, že vytváří neustále aktualizovaný průměr za určité období. Mezi běžné typy patří jednoduchý klouzavý průměr (SMA) a exponenciální klouzavý průměr (EMA). Pomáhá identifikovat trendy a úrovně podpory/rezistence.',
            },
            es: {
                examples: ['La media móvil de 20 días muestra el precio de cierre promedio de los últimos 20 días'],
                aliases: ['MA', 'SMA', 'EMA'],
                term: 'Media móvil',
                shortDefinition: 'Precio promedio en un período específico, actualizado continuamente.',
                fullDefinition: 'Una media móvil suaviza los datos de precios creando un promedio que se actualiza constantemente sobre un período específico. Los tipos más comunes son la media móvil simple (SMA) y la media móvil exponencial (EMA). Ayudan a identificar tendencias y niveles de soporte/resistencia.',
            },
            it: {
                examples: ['La media mobile a 20 giorni mostra il prezzo di chiusura medio degli ultimi 20 giorni'],
                aliases: ['MA', 'SMA', 'EMA'],
                term: 'Media mobile',
                shortDefinition: 'Prezzo medio su un periodo specifico, aggiornato continuamente.',
                fullDefinition: 'La media mobile smussa i dati di prezzo creando una media aggiornata costantemente su un determinato periodo. I tipi più comuni sono la media mobile semplice (SMA) e la media mobile esponenziale (EMA). Aiuta a identificare trend e livelli di supporto/resistenza.',
            },
            de: {
                examples: ['Der 20-Tage gleitende Durchschnitt zeigt den durchschnittlichen Schlusskurs der letzten 20 Tage'],
                aliases: ['MA', 'SMA', 'EMA'],
                term: 'Gleitender Durchschnitt',
                shortDefinition: 'Durchschnittspreis über einen bestimmten Zeitraum, kontinuierlich aktualisiert.',
                fullDefinition: 'Ein gleitender Durchschnitt glättet Kursdaten, indem er einen kontinuierlich aktualisierten Durchschnitt über einen bestimmten Zeitraum bildet. Zu den gängigen Typen gehören der einfache gleitende Durchschnitt (SMA) und der exponentielle gleitende Durchschnitt (EMA). Er hilft, Trends sowie Unterstützungs- und Widerstandsniveaus zu erkennen.',
            }
        }
    },
    {
        id: 'parabolic_sar',
        category: 'technical_indicators',
        relatedTerms: ['trend', 'trailing_stop', 'reversal', 'wilder', 'stop_loss'],
        tags: ['trend', 'trailing_stop', 'reversal', 'indicator'],
        translations: {
            en: {
                examples: ['In an uptrend, if price closes below the SAR dots, the SAR flips above price and may signal a reversal or exit.'],
                aliases: ['Parabolic SAR', 'SAR', 'Stop and Reverse'],
                term: 'Parabolic SAR (SAR)',
                shortDefinition: 'Trend-following indicator whose dots trail price and flip on reversals.',
                fullDefinition: 'Parabolic Stop and Reverse (SAR), developed by J. Welles Wilder Jr., plots dots above or below price. In an uptrend, dots trail below price as a dynamic trailing stop; if price crosses below them, the dots flip above price, suggesting a potential bearish reversal (and vice versa). Sensitivity is controlled by the acceleration factor (AF) and step/maximum settings (commonly AF 0.02, step 0.02, max 0.20).',
            },
            sk: {
                examples: ['V rastúcom trende, ak cena zavrie pod bodmi SAR, indikátor sa preklopí nad cenu a môže signalizovať obrat alebo výstup.'],
                aliases: ['Parabolic SAR', 'SAR', 'Stop and Reverse'],
                term: 'Parabolický SAR (SAR)',
                shortDefinition: 'Trendový indikátor, ktorého body sledujú cenu a pri obrate sa preklopia.',
                fullDefinition: 'Parabolic Stop and Reverse (SAR) od J. Wellesa Wildera zobrazuje body nad alebo pod cenou. V raste body sledujú cenu zdola ako dynamický trailing stop; ak cena klesne pod ne, body sa preklopia nad cenu a môžu signalizovať medvedí obrat (a naopak). Citlivosť sa riadi akceleračným faktorom (AF) a parametrami krok/max (bežne AF 0.02, krok 0.02, max 0.20).',
            },
            cz: {
                examples: ['V rostoucím trendu, pokud cena uzavře pod body SAR, indikátor se překlopí nad cenu a může signalizovat obrat nebo výstup.'],
                aliases: ['Parabolic SAR', 'SAR', 'Stop and Reverse'],
                term: 'Parabolický SAR (SAR)',
                shortDefinition: 'Trendový indikátor; body sledují cenu a při obratu se překlápějí.',
                fullDefinition: 'Parabolic Stop and Reverse (SAR) od J. Wellesa Wildera vykresluje body nad nebo pod cenou. V uptrendu body sledují cenu zespodu jako dynamický trailing stop; pokud cena klesne pod ně, body se překlopí nad cenu a mohou naznačit medvědí obrat (a naopak). Citlivost řídí akcelerační faktor (AF) a nastavení krok/max (obvykle AF 0.02, krok 0.02, max 0.20).',
            },
            es: {
                examples: ['En una tendencia alcista, si el precio cierra por debajo de los puntos del SAR, el SAR se invierte por encima del precio y puede indicar un giro o salida.'],
                aliases: ['SAR Parabólico', 'Parabolic SAR', 'SAR', 'Stop and Reverse'],
                term: 'SAR Parabólico (SAR)',
                shortDefinition: 'Indicador seguidor de tendencia cuyos puntos siguen al precio y se invierten en los cambios de dirección.',
                fullDefinition: 'El Parabolic Stop and Reverse (SAR), desarrollado por J. Welles Wilder Jr., traza puntos por encima o por debajo del precio. En una tendencia alcista, los puntos quedan por debajo como stop dinámico; si el precio cae por debajo, los puntos pasan arriba del precio, sugiriendo posible reversión bajista (y viceversa). La sensibilidad se controla con el factor de aceleración (AF) y los parámetros de paso/máximo (comúnmente AF 0.02, paso 0.02, máximo 0.20).',
            },
            it: {
                examples: ['In un trend rialzista, se il prezzo chiude sotto i punti SAR, il SAR si sposta sopra il prezzo e può segnalare una possibile inversione o uscita.'],
                aliases: ['SAR Parabolico', 'Parabolic SAR', 'SAR', 'Stop and Reverse'],
                term: 'SAR Parabolico (SAR)',
                shortDefinition: 'Indicatore trend-following i cui punti seguono il prezzo e si invertono ai cambi di trend.',
                fullDefinition: 'Il Parabolic Stop and Reverse (SAR), sviluppato da J. Welles Wilder Jr., traccia punti sopra o sotto il prezzo. In un uptrend i punti stanno sotto come trailing stop dinamico; se il prezzo scende sotto di essi, i punti si spostano sopra il prezzo, suggerendo una possibile inversione ribassista (e viceversa). La sensibilità è controllata dal fattore di accelerazione (AF) e dai parametri step/massimo (comunemente AF 0.02, step 0.02, max 0.20).',
            },
            de: {
                examples: ['In einem Aufwärtstrend: Schließt der Kurs unter den SAR-Punkten, dreht der SAR über den Kurs und kann eine Umkehr oder einen Ausstieg signalisieren.'],
                aliases: ['Parabolic SAR', 'SAR', 'Stop and Reverse', 'PSAR'],
                term: 'Parabolic SAR (PSAR)',
                shortDefinition: 'Trendfolgender Indikator; Punkte folgen dem Kurs und drehen bei Umkehr.',
                fullDefinition: 'Der Parabolic Stop and Reverse (SAR) nach J. Welles Wilder Jr. plottet Punkte ober- oder unterhalb des Kurses. Im Aufwärtstrend verlaufen die Punkte unter dem Kurs als dynamischer Trailing-Stop; fällt der Kurs darunter, wechseln die Punkte über den Kurs und deuten eine mögliche bärische Umkehr an (und umgekehrt). Die Empfindlichkeit wird über den Beschleunigungsfaktor (AF) sowie Step/Maximum (typisch AF 0.02, Step 0.02, Max 0.20) gesteuert.',
            }
        }
    },
    {
        id: 'cci',
        category: 'technical_indicators',
        relatedTerms: ['momentum', 'oscillator', 'mean_reversion', 'typical_price', 'overbought', 'oversold', 'divergence'],
        tags: ['momentum', 'oscillator', 'mean_reversion', 'overbought', 'oversold'],
        translations: {
            en: {
                examples: ['CCI crossing above +100 can signal strengthening momentum; below −100 may suggest weakness or a pullback.'],
                aliases: ['Commodity Channel Index'],
                term: 'CCI',
                shortDefinition: 'Oscillator measuring how far price deviates from its average; signals overbought/oversold and momentum shifts.',
                fullDefinition: 'The Commodity Channel Index (CCI), developed by Donald R. Lambert, is a momentum oscillator that compares the Typical Price (high+low+close)/3 to its moving average and normalizes the difference using mean absolute deviation. It oscillates around zero; readings above +100 often indicate strength/overbought, and below −100 weakness/oversold. Traders use CCI for momentum shifts, mean-reversion setups, and divergences.',
            },
            sk: {
                examples: ['Prekročenie CCI nad +100 môže signalizovať silnejúci momentum; pod −100 môže naznačovať slabosť alebo korekciu.'],
                aliases: ['Commodity Channel Index'],
                term: 'CCI',
                shortDefinition: 'Oscilátor merajúci odchýlku ceny od priemeru; signalizuje prekúpenosť/prepredanosť a zmeny momenta.',
                fullDefinition: 'Commodity Channel Index (CCI), ktorý vyvinul Donald R. Lambert, je momentový oscilátor porovnávajúci typickú cenu (high+low+close)/3 s jej kĺzavým priemerom a normalizujúci rozdiel pomocou priemernej absolútnej odchýlky. Oskiluje okolo nuly; hodnoty nad +100 často znamenajú silu/prekúpenosť a pod −100 slabosť/prepredanosť. CCI sa používa na sledovanie zmien momenta, mean-reversion stratégií a divergencií.',
            },
            cz: {
                examples: ['Průraz CCI nad +100 může signalizovat sílící momentum; pod −100 může naznačovat slabost či korekci.'],
                aliases: ['Commodity Channel Index'],
                term: 'CCI',
                shortDefinition: 'Oscilátor měřící odchylku ceny od průměru; signalizuje překoupení/přeprodání a změny momenta.',
                fullDefinition: 'Commodity Channel Index (CCI), vyvinutý Donaldem R. Lambertem, je momentový oscilátor, který porovnává typickou cenu (high+low+close)/3 s jejím klouzavým průměrem a normalizuje rozdíl pomocí průměrné absolutní odchylky. Kmitá okolo nuly; hodnoty nad +100 často značí sílu/překoupení a pod −100 slabost/přeprodání. CCI se používá pro zachycení změn momenta, mean-reversion nastavení a divergencí.',
            },
            es: {
                examples: ['Un CCI por encima de +100 puede indicar impulso creciente; por debajo de −100 puede sugerir debilidad o corrección.'],
                aliases: ['Índice de Canal de Mercancías'],
                term: 'CCI',
                shortDefinition: 'Oscilador que mide cuánto se desvía el precio de su promedio; señala sobrecompra/sobreventa y cambios de impulso.',
                fullDefinition: 'El Commodity Channel Index (CCI), desarrollado por Donald R. Lambert, es un oscilador de momento que compara el Precio Típico (alto+bajo+cierre)/3 con su media móvil y normaliza la diferencia usando la desviación media absoluta. Oscila en torno a cero; lecturas por encima de +100 suelen indicar fuerza/sobrecompra y por debajo de −100 debilidad/sobreventa. Se usa para cambios de impulso, estrategias de reversión a la media y divergencias.',
            },
            it: {
                examples: ['Un CCI sopra +100 può segnalare momentum in rafforzamento; sotto −100 può indicare debolezza o correzione.'],
                aliases: ['Commodity Channel Index'],
                term: 'CCI',
                shortDefinition: 'Oscillatore che misura quanto il prezzo si discosta dalla media; segnala ipercomprato/ipervenduto e cambi di momentum.',
                fullDefinition: 'Il Commodity Channel Index (CCI), sviluppato da Donald R. Lambert, è un oscillatore di momentum che confronta il Prezzo Tipico (massimo+minimo+chiusura)/3 con la sua media mobile e normalizza la differenza usando la deviazione media assoluta. Oscilla intorno allo zero; valori sopra +100 indicano spesso forza/ipercomprato e sotto −100 debolezza/ipervenduto. Si usa per cambi di momentum, strategie di mean-reversion e divergenze.',
            },
            de: {
                examples: ['Steigt der CCI über +100, kann das auf zunehmendes Momentum hindeuten; unter −100 auf Schwäche oder eine Korrektur.'],
                aliases: ['Commodity Channel Index'],
                term: 'CCI',
                shortDefinition: 'Oszillator, der die Abweichung des Kurses vom Durchschnitt misst; zeigt Überkauft/Überverkauft und Momentumwechsel an.',
                fullDefinition: 'Der Commodity Channel Index (CCI), entwickelt von Donald R. Lambert, ist ein Momentum-Oszillator, der den Typischen Preis (Hoch+Tief+Schluss)/3 mit seinem gleitenden Durchschnitt vergleicht und die Differenz über die mittlere absolute Abweichung normalisiert. Er oszilliert um null; Werte über +100 deuten oft auf Stärke/Überkauftheit hin, unter −100 auf Schwäche/Überverkauftheit. CCI wird für Momentumwechsel, Mean-Reversion-Setups und Divergenzen genutzt.',
            }
        }
    },
    {
        id: 'obv',
        category: 'technical_indicators',
        relatedTerms: ['volume', 'trend', 'momentum', 'divergence'],
        tags: ['volume', 'trend', 'momentum', 'confirmation'],
        translations: {
            en: {
                examples: ['If price is flat but OBV rises, it may signal accumulation and a potential breakout.'],
                aliases: ['On-Balance Volume'],
                term: 'OBV',
                shortDefinition: 'Cumulative volume indicator used to confirm price trends or spot divergences.',
                fullDefinition: 'On-Balance Volume (OBV), developed by Joseph Granville, adds volume on up days and subtracts it on down days, creating a cumulative line. Rising OBV with rising price confirms a trend, while divergences (e.g., OBV rising while price falls) can warn of potential reversals.',
            },
            sk: {
                examples: ['Ak je cena stabilná, ale OBV rastie, môže to signalizovať akumuláciu a možný prieraz.'],
                aliases: ['On-Balance Volume'],
                term: 'OBV',
                shortDefinition: 'Kumulatívny indikátor objemu používaný na potvrdenie trendov alebo odhalenie divergencií.',
                fullDefinition: 'On-Balance Volume (OBV), ktorý vyvinul Joseph Granville, sčítava objem v dňoch rastu ceny a odčítava ho v dňoch poklesu, čím vytvára kumulatívnu líniu. Rastúce OBV spolu s rastúcou cenou potvrdzuje trend, zatiaľ čo divergencie (napr. OBV rastie, ale cena klesá) môžu varovať pred možným obratom.',
            },
            cz: {
                examples: ['Pokud je cena stabilní, ale OBV roste, může to signalizovat akumulaci a možný průraz.'],
                aliases: ['On-Balance Volume'],
                term: 'OBV',
                shortDefinition: 'Kumulativní indikátor objemu používaný k potvrzení trendů nebo odhalení divergencí.',
                fullDefinition: 'On-Balance Volume (OBV), vyvinutý Josephem Granvillem, sčítá objem v růstových dnech a odečítá jej v poklesových dnech, čímž vytváří kumulativní linii. Rostoucí OBV spolu s rostoucí cenou potvrzuje trend, zatímco divergence (např. OBV roste, ale cena klesá) mohou varovat před možným obratem.',
            },
            es: {
                examples: ['Si el precio está estable pero el OBV sube, puede señalar acumulación y una posible ruptura.'],
                aliases: ['Volumen en Balance'],
                term: 'OBV',
                shortDefinition: 'Indicador acumulativo de volumen usado para confirmar tendencias o detectar divergencias.',
                fullDefinition: 'El On-Balance Volume (OBV), desarrollado por Joseph Granville, suma el volumen en días alcistas y lo resta en días bajistas, creando una línea acumulativa. Un OBV ascendente junto con un precio ascendente confirma la tendencia, mientras que divergencias (por ejemplo, OBV sube mientras el precio baja) pueden advertir de posibles giros.',
            },
            it: {
                examples: ['Se il prezzo è stabile ma l’OBV sale, può segnalare accumulazione e un potenziale breakout.'],
                aliases: ['On-Balance Volume'],
                term: 'OBV',
                shortDefinition: 'Indicatore cumulativo del volume usato per confermare trend o individuare divergenze.',
                fullDefinition: 'L’On-Balance Volume (OBV), sviluppato da Joseph Granville, aggiunge il volume nei giorni di rialzo e lo sottrae nei giorni di ribasso, creando una linea cumulativa. Un OBV crescente insieme al prezzo conferma il trend, mentre divergenze (ad es. OBV in salita mentre il prezzo scende) possono segnalare possibili inversioni.',
            },
            de: {
                examples: ['Wenn der Kurs seitwärts läuft, OBV aber steigt, kann das auf Akkumulation und einen möglichen Ausbruch hindeuten.'],
                aliases: ['On-Balance-Volumen'],
                term: 'OBV',
                shortDefinition: 'Kumulativer Volumenindikator zur Bestätigung von Trends oder Erkennung von Divergenzen.',
                fullDefinition: 'Das On-Balance-Volumen (OBV), entwickelt von Joseph Granville, addiert das Volumen an Tagen mit Kursanstieg und subtrahiert es an Tagen mit Kursrückgang, wodurch eine kumulative Linie entsteht. Steigendes OBV zusammen mit steigenden Kursen bestätigt einen Trend, während Divergenzen (z. B. OBV steigt, Kurs fällt) vor möglichen Umkehrungen warnen können.',
            }
        }
    },
    {
        id: 'momentum',
        category: 'technical_indicators',
        relatedTerms: ['rate_of_change', 'trend', 'oscillator', 'strength'],
        tags: ['momentum', 'trend', 'oscillator', 'strength'],
        translations: {
            en: {
                examples: ['If price is 55 today and was 50 ten days ago, momentum (10) = 55 − 50 = 5.'],
                aliases: ['Momentum Indicator'],
                term: 'Momentum',
                shortDefinition: 'Measures the speed of price changes to identify trend strength or weakness.',
                fullDefinition: 'The Momentum indicator calculates the difference between the current price and the price from a set number of periods ago. Positive momentum indicates upward strength, while negative momentum suggests weakness. Traders use it to spot trend continuation, potential reversals, or overbought/oversold conditions.',
            },
            sk: {
                examples: ['Ak je dnešná cena 55 a pred desiatimi dňami bola 50, momentum (10) = 55 − 50 = 5.'],
                aliases: ['Momentum indikátor'],
                term: 'Momentum',
                shortDefinition: 'Meria rýchlosť zmien ceny na určenie sily alebo slabosti trendu.',
                fullDefinition: 'Momentum indikátor počíta rozdiel medzi aktuálnou cenou a cenou spred určitého počtu období. Kladné momentum signalizuje silu rastu, zatiaľ čo záporné signalizuje slabosť. Obchodníci ho používajú na sledovanie pokračovania trendu, možných obratov alebo prekúpenosti/prepredanosti.',
            },
            cz: {
                examples: ['Pokud je dnešní cena 55 a před deseti dny byla 50, momentum (10) = 55 − 50 = 5.'],
                aliases: ['Momentum indikátor'],
                term: 'Momentum',
                shortDefinition: 'Měří rychlost změn ceny k určení síly či slabosti trendu.',
                fullDefinition: 'Momentum indikátor počítá rozdíl mezi aktuální cenou a cenou před určitým počtem období. Kladné momentum ukazuje sílu růstu, zatímco záporné ukazuje slabost. Obchodníci ho používají k odhadu pokračování trendu, možných obratů nebo překoupení/přeprodání.',
            },
            es: {
                examples: ['Si el precio actual es 55 y hace diez días era 50, el momentum (10) = 55 − 50 = 5.'],
                aliases: ['Indicador de Momentum'],
                term: 'Momentum',
                shortDefinition: 'Mide la velocidad de los cambios de precio para identificar la fuerza o debilidad de la tendencia.',
                fullDefinition: 'El indicador de Momentum calcula la diferencia entre el precio actual y el precio de hace un número determinado de periodos. Un momentum positivo indica fuerza alcista, mientras que uno negativo sugiere debilidad. Se usa para detectar continuación de tendencias, posibles giros o condiciones de sobrecompra/sobreventa.',
            },
            it: {
                examples: ['Se il prezzo è 55 oggi e 50 dieci giorni fa, il momentum (10) = 55 − 50 = 5.'],
                aliases: ['Indicatore Momentum'],
                term: 'Momentum',
                shortDefinition: 'Misura la velocità dei cambiamenti di prezzo per individuare la forza o la debolezza del trend.',
                fullDefinition: 'L’indicatore Momentum calcola la differenza tra il prezzo attuale e il prezzo di un certo numero di periodi fa. Momentum positivo indica forza rialzista, negativo suggerisce debolezza. È usato per identificare la continuazione dei trend, possibili inversioni o condizioni di ipercomprato/ipervenduto.',
            },
            de: {
                examples: ['Liegt der Kurs heute bei 55 und vor zehn Tagen bei 50, dann beträgt das Momentum (10) = 55 − 50 = 5.'],
                aliases: ['Momentum-Indikator'],
                term: 'Momentum',
                shortDefinition: 'Misst die Geschwindigkeit der Kursänderungen, um Trendstärke oder -schwäche zu erkennen.',
                fullDefinition: 'Der Momentum-Indikator berechnet die Differenz zwischen dem aktuellen Kurs und dem Kurs vor einer bestimmten Anzahl von Perioden. Positives Momentum zeigt Aufwärtsstärke, negatives deutet auf Schwäche hin. Trader nutzen ihn, um Trendfortsetzungen, mögliche Umkehrungen oder Überkauft-/Überverkauft-Situationen zu erkennen.',
            }
        }
    },
    {
        id: 'ema',
        category: 'technical_indicators',
        relatedTerms: ['moving_average', 'trend', 'smoothing', 'sma'],
        tags: ['trend', 'smoothing', 'average', 'support_resistance'],
        translations: {
            en: {
                examples: ['A 20-day EMA reacts faster to price changes than a 20-day SMA.'],
                aliases: ['Exponential Moving Average'],
                term: 'EMA',
                shortDefinition: 'Moving average giving more weight to recent prices for faster trend detection.',
                fullDefinition: 'The Exponential Moving Average (EMA) is a type of moving average that gives greater weight to recent prices, making it more responsive to new information than the Simple Moving Average (SMA). Traders use EMAs to identify trends, dynamic support/resistance, and signal crossovers (e.g., 50-day EMA crossing above 200-day EMA).',
            },
            sk: {
                examples: ['20-dňový EMA reaguje rýchlejšie na zmeny ceny než 20-dňový SMA.'],
                aliases: ['Exponenciálny kĺzavý priemer'],
                term: 'EMA',
                shortDefinition: 'Kĺzavý priemer, ktorý dáva väčšiu váhu nedávnym cenám a rýchlejšie reaguje na trend.',
                fullDefinition: 'Exponenciálny kĺzavý priemer (EMA) je typ kĺzavého priemeru, ktorý priraďuje väčšiu váhu novším cenám. Vďaka tomu rýchlejšie reaguje na nové informácie ako jednoduchý kĺzavý priemer (SMA). Obchodníci používajú EMA na identifikáciu trendov, dynamickej podpory/rezistencie a signálov kríženia (napr. 50-dňový EMA nad 200-dňovým EMA).',
            },
            cz: {
                examples: ['20denní EMA reaguje rychleji na změny ceny než 20denní SMA.'],
                aliases: ['Exponenciální klouzavý průměr'],
                term: 'EMA',
                shortDefinition: 'Klouzavý průměr, který přikládá větší váhu novým cenám a rychle reaguje na trend.',
                fullDefinition: 'Exponenciální klouzavý průměr (EMA) je typ klouzavého průměru, který přiděluje vyšší váhu novějším cenám. Díky tomu reaguje rychleji na nové informace než jednoduchý klouzavý průměr (SMA). Obchodníci používají EMA k identifikaci trendů, dynamických úrovní podpory/rezistence a signálů z křížení (např. 50denní EMA nad 200denním EMA).',
            },
            es: {
                examples: ['Una EMA de 20 días reacciona más rápido a los cambios de precio que una SMA de 20 días.'],
                aliases: ['Media móvil exponencial'],
                term: 'EMA',
                shortDefinition: 'Media móvil que da mayor peso a los precios recientes para detectar tendencias más rápido.',
                fullDefinition: 'La Media Móvil Exponencial (EMA) es un tipo de media móvil que otorga mayor peso a los precios más recientes, haciéndola más sensible a los cambios que la Media Móvil Simple (SMA). Los traders la usan para identificar tendencias, niveles dinámicos de soporte/resistencia y señales de cruce (por ejemplo, EMA de 50 días cruzando sobre la EMA de 200 días).',
            },
            it: {
                examples: ['Una EMA a 20 giorni reagisce più velocemente ai cambiamenti di prezzo rispetto a una SMA a 20 giorni.'],
                aliases: ['Media mobile esponenziale'],
                term: 'EMA',
                shortDefinition: 'Media mobile che attribuisce più peso ai prezzi recenti, rilevando i trend più rapidamente.',
                fullDefinition: 'La Media Mobile Esponenziale (EMA) è un tipo di media mobile che attribuisce maggiore peso ai prezzi più recenti, risultando più reattiva rispetto alla Media Mobile Semplice (SMA). I trader la usano per identificare trend, livelli dinamici di supporto/resistenza e segnali di incrocio (ad es. EMA a 50 giorni che supera EMA a 200 giorni).',
            },
            de: {
                examples: ['Ein 20-Tage-EMA reagiert schneller auf Kursänderungen als ein 20-Tage-SMA.'],
                aliases: ['Exponentieller gleitender Durchschnitt'],
                term: 'EMA',
                shortDefinition: 'Gleitender Durchschnitt, der neueren Kursen mehr Gewicht gibt und Trends schneller erfasst.',
                fullDefinition: 'Der Exponentielle gleitende Durchschnitt (EMA) ist eine Art gleitender Durchschnitt, der neueren Kursen stärkeres Gewicht gibt. Dadurch reagiert er schneller auf Veränderungen als der einfache gleitende Durchschnitt (SMA). Trader nutzen den EMA, um Trends, dynamische Unterstützungs-/Widerstandsniveaus und Signal-Kreuzungen zu erkennen (z. B. 50-Tage-EMA über 200-Tage-EMA).',
            }
        }
    },

    // Market Metrics
    {
        id: 'volume',
        category: 'market_metrics',
        relatedTerms: ['liquidity', 'price_action', 'momentum'],
        tags: ['trading', 'liquidity', 'confirmation'],
        translations: {
            en: {
                examples: ['High volume on a breakout confirms the strength of the move'],
                aliases: ['Trading Volume'],
                term: 'Volume',
                shortDefinition: 'Number of shares traded during a specific period.',
                fullDefinition: 'Volume represents the total number of shares traded during a given time period. High volume often indicates strong interest and can confirm price movements, while low volume may suggest lack of conviction in price moves.',
            },
            sk: {
                examples: ['Vysoký objem pri prielome potvrdzuje silu pohybu ceny'],
                aliases: ['Obchodný objem'],
                term: 'Objem',
                shortDefinition: 'Počet akcií zobchodovaných počas určitého obdobia.',
                fullDefinition: 'Objem predstavuje celkový počet akcií zobchodovaných za dané obdobie. Vysoký objem často signalizuje silný záujem a môže potvrdiť pohyby ceny, zatiaľ čo nízky objem môže naznačovať slabší záujem investorov.',
            },
            cz: {
                examples: ['Vysoký objem při proražení potvrzuje sílu pohybu ceny'],
                aliases: ['Obchodní objem'],
                term: 'Objem',
                shortDefinition: 'Počet akcií zobchodovaných během určitého období.',
                fullDefinition: 'Objem představuje celkový počet akcií zobchodovaných za dané období. Vysoký objem často naznačuje silný zájem a může potvrdit pohyby cen, zatímco nízký objem může signalizovat slabší zájem investorů.',
            },
            es: {
                examples: ['Un alto volumen en una ruptura confirma la fuerza del movimiento'],
                aliases: ['Volumen de negociación'],
                term: 'Volumen',
                shortDefinition: 'Número de acciones negociadas en un período específico.',
                fullDefinition: 'El volumen representa el número total de acciones negociadas en un período de tiempo dado. Un volumen alto suele indicar fuerte interés y puede confirmar movimientos de precio, mientras que un volumen bajo puede sugerir falta de convicción.',
            },
            it: {
                examples: ['Un alto volume durante un breakout conferma la forza del movimento'],
                aliases: ['Volume di negoziazione'],
                term: 'Volume',
                shortDefinition: 'Numero di azioni scambiate in un determinato periodo.',
                fullDefinition: 'Il volume rappresenta il numero totale di azioni scambiate in un determinato periodo di tempo. Un volume elevato spesso indica forte interesse e può confermare i movimenti di prezzo, mentre un volume basso può suggerire mancanza di convinzione.',
            },
            de: {
                examples: ['Hohes Volumen bei einem Ausbruch bestätigt die Stärke der Bewegung'],
                aliases: ['Handelsvolumen'],
                term: 'Volumen',
                shortDefinition: 'Anzahl der in einem bestimmten Zeitraum gehandelten Aktien.',
                fullDefinition: 'Das Volumen gibt die Gesamtzahl der in einem bestimmten Zeitraum gehandelten Aktien an. Hohes Volumen deutet oft auf starkes Interesse hin und kann Kursbewegungen bestätigen, während niedriges Volumen mangelndes Vertrauen signalisieren kann.',
            }
        }
    },
    {
        id: 'beta',
        category: 'risk_management',
        relatedTerms: ['volatility', 'market_risk', 'correlation'],
        tags: ['volatility', 'risk', 'correlation', 'market'],
        translations: {
            en: {
                examples: ['A beta of 1.5 means the stock typically moves 50% more than the market'],
                aliases: ['Beta Coefficient'],
                term: 'Beta',
                shortDefinition: 'Measures stock volatility relative to the overall market.',
                fullDefinition: 'Beta measures how much a stock\'s price moves in relation to the overall market. A beta of 1 means the stock moves with the market, above 1 means more volatile, and below 1 means less volatile than the market.',
            },
            sk: {
                examples: ['Beta 1,5 znamená, že akcia sa zvyčajne pohybuje o 50 % viac ako trh'],
                aliases: ['Beta koeficient'],
                term: 'Beta',
                shortDefinition: 'Meria volatilitu akcie vo vzťahu k celému trhu.',
                fullDefinition: 'Beta meria, ako sa cena akcie pohybuje v porovnaní s celkovým trhom. Beta = 1 znamená, že akcia sa pohybuje spolu s trhom, nad 1 znamená vyššiu volatilitu a pod 1 znamená nižšiu volatilitu ako trh.',
            },
            cz: {
                examples: ['Beta 1,5 znamená, že akcie se obvykle pohybuje o 50 % více než trh'],
                aliases: ['Beta koeficient'],
                term: 'Beta',
                shortDefinition: 'Měří volatilitu akcie vzhledem k celkovému trhu.',
                fullDefinition: 'Beta měří, jak se cena akcie pohybuje ve srovnání s celkovým trhem. Beta = 1 znamená, že akcie kopíruje trh, nad 1 znamená vyšší volatilitu a pod 1 nižší volatilitu než trh.',
            },
            es: {
                examples: ['Un beta de 1,5 significa que la acción suele moverse un 50 % más que el mercado'],
                aliases: ['Coeficiente Beta'],
                term: 'Beta',
                shortDefinition: 'Mide la volatilidad de la acción en relación con el mercado.',
                fullDefinition: 'El beta mide cuánto se mueve el precio de una acción en relación con el mercado en general. Un beta de 1 significa que la acción se mueve con el mercado, por encima de 1 significa más volatilidad y por debajo de 1 menos volatilidad.',
            },
            it: {
                examples: ['Un beta di 1,5 significa che il titolo si muove tipicamente il 50 % in più rispetto al mercato'],
                aliases: ['Coefficiente Beta'],
                term: 'Beta',
                shortDefinition: 'Misura la volatilità del titolo rispetto al mercato nel suo complesso.',
                fullDefinition: 'Il beta misura quanto si muove il prezzo di un’azione in relazione al mercato complessivo. Un beta pari a 1 indica che l’azione si muove con il mercato, sopra 1 indica maggiore volatilità, sotto 1 minore volatilità.',
            },
            de: {
                examples: ['Ein Beta von 1,5 bedeutet, dass die Aktie sich typischerweise 50 % stärker bewegt als der Markt'],
                aliases: ['Beta-Koeffizient'],
                term: 'Beta',
                shortDefinition: 'Misst die Volatilität einer Aktie im Vergleich zum Gesamtmarkt.',
                fullDefinition: 'Das Beta misst, wie stark sich der Aktienkurs im Verhältnis zum Gesamtmarkt bewegt. Ein Beta von 1 bedeutet, dass die Aktie sich im Gleichschritt mit dem Markt bewegt, über 1 bedeutet höhere Volatilität und unter 1 geringere Volatilität.',
            }
        }
    },

    // Risk Management
    {
        id: 'volatility',
        category: 'risk_management',
        relatedTerms: ['risk', 'standard_deviation', 'price_action'],
        tags: ['risk', 'price_movement', 'variation', 'fluctuation'],
        translations: {
            en: {
                examples: ['A stock moving 5% daily has higher volatility than one moving 1% daily'],
                aliases: ['Price Volatility'],
                term: 'Volatility',
                shortDefinition: 'Measure of price fluctuation over time.',
                fullDefinition: 'Volatility measures the degree of variation in a stock\'s price over time. Higher volatility indicates larger price swings, which can mean both higher potential returns and higher risk. It\'s often measured using standard deviation.',
            },
            sk: {
                examples: ['Akcia, ktorá sa denne pohybuje o 5 %, má vyššiu volatilitu než tá, ktorá sa pohybuje o 1 %'],
                aliases: ['Cenová volatilita'],
                term: 'Volatilita',
                shortDefinition: 'Miera kolísania ceny v čase.',
                fullDefinition: 'Volatilita meria rozsah cenových výkyvov akcie v čase. Vyššia volatilita znamená väčšie cenové pohyby, čo môže znamenať vyšší potenciálny výnos aj vyššie riziko. Často sa meria pomocou štandardnej odchýlky.',
            },
            cz: {
                examples: ['Akcie, která se denně pohybuje o 5 %, má vyšší volatilitu než ta, která se pohybuje o 1 %'],
                aliases: ['Cenová volatilita'],
                term: 'Volatilita',
                shortDefinition: 'Míra kolísání ceny v čase.',
                fullDefinition: 'Volatilita měří rozsah cenových výkyvů akcie v čase. Vyšší volatilita znamená větší cenové pohyby, což může znamenat vyšší potenciální výnos i vyšší riziko. Často se měří pomocí směrodatné odchylky.',
            },
            es: {
                examples: ['Una acción que se mueve un 5 % diario tiene más volatilidad que otra que se mueve un 1 %'],
                aliases: ['Volatilidad del precio'],
                term: 'Volatilidad',
                shortDefinition: 'Medida de la fluctuación del precio a lo largo del tiempo.',
                fullDefinition: 'La volatilidad mide el grado de variación en el precio de una acción a lo largo del tiempo. Una mayor volatilidad indica movimientos de precios más amplios, lo que puede significar tanto mayores rendimientos potenciales como mayor riesgo. A menudo se mide con la desviación estándar.',
            },
            it: {
                examples: ['Un’azione che si muove del 5 % al giorno ha maggiore volatilità rispetto a una che si muove dell’1 %'],
                aliases: ['Volatilità del prezzo'],
                term: 'Volatilità',
                shortDefinition: 'Misura delle fluttuazioni di prezzo nel tempo.',
                fullDefinition: 'La volatilità misura il grado di variazione del prezzo di un’azione nel tempo. Una volatilità più alta indica oscillazioni maggiori, il che può significare rendimenti potenziali più elevati ma anche un rischio maggiore. Spesso viene misurata con la deviazione standard.',
            },
            de: {
                examples: ['Eine Aktie, die sich täglich um 5 % bewegt, hat eine höhere Volatilität als eine, die sich um 1 % bewegt'],
                aliases: ['Preisvolatilität'],
                term: 'Volatilität',
                shortDefinition: 'Maß für die Preisschwankungen über die Zeit.',
                fullDefinition: 'Volatilität misst den Grad der Schwankungen eines Aktienkurses im Zeitverlauf. Höhere Volatilität bedeutet größere Kursschwankungen, was sowohl höhere potenzielle Renditen als auch höheres Risiko bedeuten kann. Sie wird häufig mit der Standardabweichung gemessen.',
            }
        }
    },
    {
        id: 'support_resistance',
        category: 'technical_indicators',
        relatedTerms: ['price_action', 'trend', 'breakout'],
        tags: ['price_levels', 'psychology', 'barriers', 'trend'],
        translations: {
            en: {
                examples: ['Stock bouncing off $50 multiple times establishes $50 as support'],
                aliases: ['Support Level', 'Resistance Level'],
                term: 'Support and Resistance',
                shortDefinition: 'Price levels where buying or selling pressure typically emerges.',
                fullDefinition: 'Support is a price level where demand is strong enough to prevent further decline. Resistance is a level where selling pressure prevents further price increases. These levels often act as psychological barriers for traders.',
            },
            sk: {
                examples: ['Akcia, ktorá sa viackrát odrazí od 50 USD, vytvára úroveň podpory na 50 USD'],
                aliases: ['Úroveň podpory', 'Úroveň rezistencie'],
                term: 'Podpora a rezistencia',
                shortDefinition: 'Cenové úrovne, kde sa typicky objavuje nákupný alebo predajný tlak.',
                fullDefinition: 'Podpora je cenová úroveň, kde je dopyt dostatočne silný na to, aby zabránil ďalšiemu poklesu. Rezistencia je úroveň, kde predajný tlak bráni ďalšiemu rastu ceny. Tieto úrovne často pôsobia ako psychologické bariéry pre obchodníkov.',
            },
            cz: {
                examples: ['Akcie, která se několikrát odrazí od 50 USD, vytváří úroveň podpory na 50 USD'],
                aliases: ['Úroveň podpory', 'Úroveň rezistence'],
                term: 'Podpora a rezistence',
                shortDefinition: 'Cenové úrovně, kde se obvykle objevuje nákupní nebo prodejní tlak.',
                fullDefinition: 'Podpora je cenová úroveň, kde je poptávka dostatečně silná, aby zabránila dalšímu poklesu. Rezistence je úroveň, kde prodejní tlak brání dalšímu růstu ceny. Tyto úrovně často působí jako psychologické bariéry pro obchodníky.',
            },
            es: {
                examples: ['Una acción que rebota varias veces en 50 USD establece ese nivel como soporte'],
                aliases: ['Nivel de soporte', 'Nivel de resistencia'],
                term: 'Soporte y resistencia',
                shortDefinition: 'Niveles de precio donde normalmente surge presión de compra o venta.',
                fullDefinition: 'El soporte es un nivel de precio donde la demanda es lo suficientemente fuerte como para evitar más caídas. La resistencia es un nivel donde la presión de venta impide que el precio siga subiendo. Estos niveles suelen actuar como barreras psicológicas para los traders.',
            },
            it: {
                examples: ['Un titolo che rimbalza più volte a 50 USD stabilisce quel livello come supporto'],
                aliases: ['Livello di supporto', 'Livello di resistenza'],
                term: 'Supporto e resistenza',
                shortDefinition: 'Livelli di prezzo in cui di solito emerge pressione di acquisto o vendita.',
                fullDefinition: 'Il supporto è un livello di prezzo in cui la domanda è abbastanza forte da impedire ulteriori ribassi. La resistenza è un livello in cui la pressione di vendita impedisce ulteriori rialzi del prezzo. Questi livelli agiscono spesso come barriere psicologiche per i trader.',
            },
            de: {
                examples: ['Eine Aktie, die mehrmals bei 50 USD abprallt, etabliert dort ein Unterstützungsniveau'],
                aliases: ['Unterstützungsniveau', 'Widerstandsniveau'],
                term: 'Unterstützung und Widerstand',
                shortDefinition: 'Kursniveaus, an denen typischerweise Kauf- oder Verkaufsdruck entsteht.',
                fullDefinition: 'Unterstützung ist ein Kursniveau, bei dem die Nachfrage stark genug ist, um einen weiteren Rückgang zu verhindern. Widerstand ist ein Niveau, bei dem Verkaufsdruck weitere Kurssteigerungen verhindert. Diese Niveaus wirken oft als psychologische Barrieren für Händler.',
            }
        }
    },

    // Corporate Finance
    {
        id: 'revenue',
        category: 'corporate_finance',
        relatedTerms: ['income_statement', 'gross_profit', 'net_income'],
        tags: ['income', 'sales', 'operations', 'top_line'],
        translations: {
            en: {
                examples: ['A company selling 1,000 products at $100 each has $100,000 revenue'],
                aliases: ['Sales', 'Turnover', 'Top Line'],
                term: 'Revenue',
                shortDefinition: 'Total income generated by a company from its operations.',
                fullDefinition: 'Revenue, also called sales or turnover, is the total amount of income generated by a company from its business operations. It\'s the top line of the income statement and doesn\'t account for any costs or expenses.',
            },
            sk: {
                examples: ['Spoločnosť, ktorá predá 1 000 produktov po 100 USD, má tržby 100 000 USD'],
                aliases: ['Tržby', 'Obrat'],
                term: 'Výnosy',
                shortDefinition: 'Celkový príjem spoločnosti z jej činnosti.',
                fullDefinition: 'Výnosy, nazývané aj tržby alebo obrat, predstavujú celkový príjem spoločnosti z jej podnikateľskej činnosti. Ide o horný riadok vo výkaze ziskov a strát a nezohľadňuje žiadne náklady ani výdavky.',
            },
            cz: {
                examples: ['Společnost, která prodá 1 000 produktů po 100 USD, má tržby 100 000 USD'],
                aliases: ['Tržby', 'Obrat'],
                term: 'Výnosy',
                shortDefinition: 'Celkový příjem společnosti z její činnosti.',
                fullDefinition: 'Výnosy, nazývané také tržby nebo obrat, představují celkový příjem společnosti z její podnikatelské činnosti. Jsou horním řádkem ve výkazu zisků a ztrát a nezahrnují žádné náklady ani výdaje.',
            },
            es: {
                examples: ['Una empresa que vende 1.000 productos a 100 USD cada uno tiene ingresos de 100.000 USD'],
                aliases: ['Ventas', 'Facturación', 'Ingresos'],
                term: 'Ingresos',
                shortDefinition: 'Ingresos totales generados por una empresa a partir de sus operaciones.',
                fullDefinition: 'Los ingresos, también llamados ventas o facturación, son la cantidad total de dinero generada por una empresa a partir de sus operaciones comerciales. Representan la primera línea de la cuenta de resultados y no incluyen costos ni gastos.',
            },
            it: {
                examples: ['Un’azienda che vende 1.000 prodotti a 100 USD ciascuno ha ricavi per 100.000 USD'],
                aliases: ['Vendite', 'Fatturato', 'Ricavi'],
                term: 'Ricavi',
                shortDefinition: 'Entrate totali generate da un’azienda attraverso le proprie attività.',
                fullDefinition: 'I ricavi, chiamati anche vendite o fatturato, rappresentano l’ammontare totale generato da un’azienda attraverso le proprie attività operative. Sono la prima riga del conto economico e non tengono conto dei costi o delle spese.',
            },
            de: {
                examples: ['Ein Unternehmen, das 1.000 Produkte zu je 100 USD verkauft, hat Einnahmen von 100.000 USD'],
                aliases: ['Umsatz', 'Erlöse'],
                term: 'Umsatz',
                shortDefinition: 'Gesamteinnahmen eines Unternehmens aus seiner Geschäftstätigkeit.',
                fullDefinition: 'Der Umsatz, auch als Erlöse oder Turnover bezeichnet, ist der Gesamtbetrag der Einnahmen, den ein Unternehmen aus seiner Geschäftstätigkeit erzielt. Er steht ganz oben in der Gewinn- und Verlustrechnung und berücksichtigt keine Kosten oder Aufwendungen.',
            }
        }
    },
    {
        id: 'net_income',
        category: 'corporate_finance',
        relatedTerms: ['revenue', 'expenses', 'eps', 'profitability'],
        tags: ['profit', 'earnings', 'bottom_line', 'after_tax'],
        translations: {
            en: {
                examples: ['Revenue of $1M minus $800K expenses equals $200K net income'],
                aliases: ['Net Profit', 'Bottom Line', 'Earnings'],
                term: 'Net Income',
                shortDefinition: 'Company\'s total profit after all expenses and taxes.',
                fullDefinition: 'Net Income is a company\'s total earnings (profit) after subtracting all expenses, including operating costs, interest, taxes, and depreciation. It\'s also known as the bottom line and is used to calculate earnings per share.',
            },
            sk: {
                examples: ['Výnosy 1 milión USD mínus 800 000 USD náklady = čistý zisk 200 000 USD'],
                aliases: ['Čistý zisk', 'Konečný výsledok'],
                term: 'Čistý zisk',
                shortDefinition: 'Celkový zisk spoločnosti po odpočítaní všetkých nákladov a daní.',
                fullDefinition: 'Čistý zisk je celkový zisk spoločnosti po odpočítaní všetkých nákladov vrátane prevádzkových nákladov, úrokov, daní a odpisov. Často sa nazýva „spodný riadok“ a používa sa na výpočet zisku na akciu.',
            },
            cz: {
                examples: ['Výnosy 1 milion USD mínus 800 000 USD náklady = čistý zisk 200 000 USD'],
                aliases: ['Čistý zisk', 'Konečný výsledek'],
                term: 'Čistý zisk',
                shortDefinition: 'Celkový zisk společnosti po odečtení všech nákladů a daní.',
                fullDefinition: 'Čistý zisk je celkový zisk společnosti po odečtení všech nákladů včetně provozních nákladů, úroků, daní a odpisů. Často se nazývá „spodní řádek“ a používá se k výpočtu zisku na akcii.',
            },
            es: {
                examples: ['Ingresos de 1 millón USD menos 800 000 USD de gastos = ingreso neto de 200 000 USD'],
                aliases: ['Beneficio neto', 'Resultado final', 'Ganancias'],
                term: 'Ingreso neto',
                shortDefinition: 'Beneficio total de la empresa después de todos los gastos e impuestos.',
                fullDefinition: 'El ingreso neto es la ganancia total de una empresa después de restar todos los gastos, incluidos los costos operativos, intereses, impuestos y depreciación. También se conoce como la “última línea” y se utiliza para calcular el beneficio por acción.',
            },
            it: {
                examples: ['Ricavi di 1 milione USD meno 800.000 USD di spese = utile netto di 200.000 USD'],
                aliases: ['Utile netto', 'Risultato finale'],
                term: 'Utile netto',
                shortDefinition: 'Profitto totale della società dopo tutte le spese e le imposte.',
                fullDefinition: 'L’utile netto è il guadagno totale di una società dopo aver sottratto tutte le spese, inclusi costi operativi, interessi, imposte e ammortamenti. È anche noto come “riga finale” e viene utilizzato per calcolare l’utile per azione.',
            },
            de: {
                examples: ['Einnahmen von 1 Mio. USD minus 800.000 USD Kosten = Nettogewinn von 200.000 USD'],
                aliases: ['Nettogewinn', 'Jahresüberschuss', 'Bottom Line'],
                term: 'Nettogewinn',
                shortDefinition: 'Gesamtgewinn des Unternehmens nach allen Kosten und Steuern.',
                fullDefinition: 'Der Nettogewinn ist der gesamte Gewinn eines Unternehmens nach Abzug aller Kosten, einschließlich Betriebskosten, Zinsen, Steuern und Abschreibungen. Er wird auch „Bottom Line“ genannt und dient zur Berechnung des Gewinns je Aktie.',
            }
        }
    },
];

// Utility functions
export const getTermById = (id: string): GlossaryTerm | undefined => {
  return GLOSSARY_TERMS.find(term => term.id === id);
};

export const searchTerms = (query: string, language: string): GlossaryTerm[] => {
  if (!query.trim()) return GLOSSARY_TERMS;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return GLOSSARY_TERMS.filter(term => 
    term.translations[language].term.toLowerCase().includes(normalizedQuery) ||
    term.translations[language].shortDefinition.toLowerCase().includes(normalizedQuery) ||
    term.translations[language].fullDefinition.toLowerCase().includes(normalizedQuery) ||
    term.translations[language].aliases?.some(alias => alias.toLowerCase().includes(normalizedQuery)) ||
    term.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))
  ).sort((a, b) => {
    // Prioritize exact matches
    const aExact = a.translations[language].term.toLowerCase() === normalizedQuery;
    const bExact = b.translations[language].term.toLowerCase() === normalizedQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // Then prioritize term name matches over definition matches
    const aTermMatch = a.translations[language].term.toLowerCase().includes(normalizedQuery);
    const bTermMatch = b.translations[language].term.toLowerCase().includes(normalizedQuery);
    if (aTermMatch && !bTermMatch) return -1;
    if (!aTermMatch && bTermMatch) return 1;

    return a.translations[language].term.localeCompare(b.translations[language].term);
  });
};

export const getTermsByCategory = (category: GlossaryCategory): GlossaryTerm[] => {
  return GLOSSARY_TERMS.filter(term => term.category === category);
};

export const getRelatedTerms = (termId: string): GlossaryTerm[] => {
  const term = getTermById(termId);
  if (!term?.relatedTerms) return [];
  
  return term.relatedTerms
    .map(id => getTermById(id))
    .filter((t): t is GlossaryTerm => t !== undefined);
};

// For detecting terms in text
export const detectTermsInText = (text: string, language: string): { term: GlossaryTerm; matches: RegExpMatchArray[] }[] => {
  const results: { term: GlossaryTerm; matches: RegExpMatchArray[] }[] = [];
  
  GLOSSARY_TERMS.forEach(term => {
    const patterns = [term.translations[language].term, ...(term.translations[language].aliases || [])];
    
    patterns.forEach(pattern => {
      // Create a regex that matches the term as a whole word, case insensitive
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = Array.from(text.matchAll(regex));
      
      if (matches.length > 0) {
        const existingResult = results.find(r => r.term.id === term.id);
        if (existingResult) {
          existingResult.matches.push(...matches);
        } else {
          results.push({ term, matches });
        }
      }
    });
  });

  return results.sort((a, b) => a.term.translations[language].term.localeCompare(b.term.translations[language].term));
};
