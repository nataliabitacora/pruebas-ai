'use client';

import { useState } from 'react';
import { Code2, Copy, Check, Menu, X, Search } from 'lucide-react';
import designTokens from '@/imports/design-tokens.json';

interface Token {
  name: string;
  value: any;
  description?: string;
  type: string;
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('color');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (value: string, tokenName: string) => {
    navigator.clipboard.writeText(value);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const flattenTokens = (obj: any, prefix = '', type = ''): Token[] => {
    let result: Token[] = [];

    Object.entries(obj).forEach(([key, value]: [string, any]) => {
      if (key.startsWith('$')) return;

      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && '$value' in value) {
        result.push({
          name: fullKey,
          value: value.$value,
          description: value.$description,
          type: value.$type || type,
        });
      } else if (value && typeof value === 'object') {
        result = [...result, ...flattenTokens(value, fullKey, type)];
      }
    });

    return result;
  };

  const tokens = designTokens as any;

  const categories = [
    { id: 'color', name: 'Colores', tokens: flattenTokens(tokens.color, '', 'color') },
    { id: 'spacing', name: 'Espaciado', tokens: flattenTokens(tokens.spacing, '', 'dimension') },
    { id: 'borderRadius', name: 'Border Radius', tokens: flattenTokens(tokens.borderRadius, '', 'dimension') },
    { id: 'fontSize', name: 'Tamaños de Fuente', tokens: flattenTokens(tokens.fontSize, '', 'dimension') },
    { id: 'fontWeight', name: 'Pesos de Fuente', tokens: flattenTokens(tokens.fontWeight, '', 'number') },
    { id: 'lineHeight', name: 'Altura de Línea', tokens: flattenTokens(tokens.lineHeight, '', 'number') },
    { id: 'shadow', name: 'Sombras', tokens: flattenTokens(tokens.shadow, '', 'shadow') },
    { id: 'components', name: 'Componentes', tokens: flattenTokens(tokens.components, '', 'component') },
  ];

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const filteredTokens = currentCategory?.tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderTokenPreview = (token: Token) => {
    if (token.type === 'color') {
      return (
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-xl border-2 border-[rgba(0,0,0,0.08)]"
            style={{ backgroundColor: token.value }}
          />
          <div>
            <code className="text-sm bg-[#F5F5F5] px-3 py-1.5 rounded-lg">{token.value}</code>
          </div>
        </div>
      );
    }

    if (token.type === 'dimension') {
      const val = String(token.value);
      if (val.includes('px') && !val.includes(' ')) {
        return (
          <div className="flex items-center gap-4">
            <div
              className="h-10 bg-gradient-to-r from-[#FF5722] to-[#00BFA5] rounded-lg"
              style={{ width: val }}
            />
            <code className="text-sm bg-[#F5F5F5] px-3 py-1.5 rounded-lg">{val}</code>
          </div>
        );
      }
      return <code className="text-sm bg-[#F5F5F5] px-3 py-1.5 rounded-lg">{val}</code>;
    }

    if (token.type === 'shadow') {
      const shadowVal = typeof token.value === 'object'
        ? `${token.value.offsetX} ${token.value.offsetY} ${token.value.blur} ${token.value.spread} ${token.value.color}`
        : String(token.value);
      return (
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 bg-white rounded-xl"
            style={{ boxShadow: shadowVal }}
          />
          <code className="text-xs bg-[#F5F5F5] px-3 py-1.5 rounded-lg break-all max-w-md">
            {shadowVal}
          </code>
        </div>
      );
    }

    if (token.type === 'number') {
      return <code className="text-sm bg-[#F5F5F5] px-3 py-1.5 rounded-lg">{token.value}</code>;
    }

    return (
      <code className="text-sm bg-[#F5F5F5] px-3 py-1.5 rounded-lg break-all">
        {JSON.stringify(token.value)}
      </code>
    );
  };

  const getCopyValue = (token: Token) => {
    if (typeof token.value === 'object') {
      return `${token.value.offsetX} ${token.value.offsetY} ${token.value.blur} ${token.value.spread} ${token.value.color}`;
    }
    return String(token.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-[#F5F5F5] rounded-lg"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Code2 className="w-8 h-8 text-[#FF5722]" />
              <div>
                <h1 className="text-xl text-[#1A1A1A]">{tokens.$metadata.name}</h1>
                <p className="text-xs text-[#616161]">v{tokens.$metadata.version}</p>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-[#616161]">{tokens.$metadata.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)]
          w-64 bg-white border-r border-[rgba(0,0,0,0.08)] p-6 transition-transform z-40
        `}>
          <nav>
            <p className="text-xs uppercase tracking-wider text-[#616161] mb-3">Categorías</p>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-2.5 rounded-lg transition-all
                      ${selectedCategory === category.id
                        ? 'bg-[#FF5722] text-white shadow-md'
                        : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                      }
                    `}
                  >
                    <span className="text-sm">{category.name}</span>
                    <span className={`
                      text-xs ml-2 px-2 py-0.5 rounded-full
                      ${selectedCategory === category.id
                        ? 'bg-white/20'
                        : 'bg-[#F5F5F5]'
                      }
                    `}>
                      {category.tokens.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#616161]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tokens..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-transparent"
              />
            </div>
          </div>

          {/* Tokens Grid */}
          <div>
            <div className="mb-6">
              <h2 className="text-3xl text-[#1A1A1A] mb-2">{currentCategory?.name}</h2>
              <p className="text-[#616161]">{filteredTokens.length} tokens disponibles</p>
            </div>

            {filteredTokens.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#616161]">No se encontraron tokens</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredTokens.map((token) => (
                  <div
                    key={token.name}
                    className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.08)] hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-mono text-sm text-[#FF5722] mb-1">
                          {token.name}
                        </h3>
                        {token.description && (
                          <p className="text-sm text-[#616161]">{token.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(getCopyValue(token), token.name)}
                        className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors shrink-0"
                      >
                        {copiedToken === token.name ? (
                          <Check className="w-4 h-4 text-[#00BFA5]" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#616161]" />
                        )}
                      </button>
                    </div>
                    <div className="pt-4 border-t border-[rgba(0,0,0,0.08)]">
                      {renderTokenPreview(token)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
