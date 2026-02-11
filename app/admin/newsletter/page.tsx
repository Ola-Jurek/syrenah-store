"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Download, Users } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  consent: boolean;
  createdAt: string;
};

function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("adminToken", token);
}

function promptAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = window.prompt("Wprowadź token admina:");
  if (token) {
    setAdminToken(token);
    return token;
  }
  return null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      const promptedToken = promptAdminToken();
      if (!promptedToken) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }
    }
    setTokenChecked(true);
  }, []);

  useEffect(() => {
    if (!tokenChecked) return;

    async function fetchSubscribers() {
      const token = getAdminToken();
      if (!token) {
        setError("Brak tokena admina");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/newsletter", {
          headers: {
            "x-admin-token": token,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("adminToken");
          setError("Nieautoryzowany dostęp. Wprowadź token ponownie.");
          const newToken = promptAdminToken();
          if (newToken) {
            fetchSubscribers();
          }
          return;
        }

        if (!res.ok) {
          throw new Error("Błąd pobierania danych newslettera");
        }

        const data = await res.json();
        setSubscribers(data.subscribers);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Błąd pobierania danych"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchSubscribers();
  }, [tokenChecked]);

  const handleExportCSV = async () => {
    const token = getAdminToken();
    if (!token) return;

    try {
      const res = await fetch("/api/admin/newsletter?format=csv", {
        headers: {
          "x-admin-token": token,
        },
      });

      if (!res.ok) {
        throw new Error("Błąd eksportu CSV");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Nie udało się wyeksportować danych.");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-black/40 py-12">Ładowanie...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-black/60 py-12">{error}</div>
    );
  }

  return (
    <>
      {/* Nagłówek */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xs uppercase tracking-widest text-black font-medium mb-1">
            Newsletter
          </h1>
          <p className="text-xs text-black/40">
            Lista osób zapisanych do newslettera
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          disabled={subscribers.length === 0}
          className="bg-[#C1A88C] hover:bg-[#B09A7C] text-white text-xs uppercase tracking-widest px-6 py-2.5 rounded-none"
        >
          <Download className="h-3.5 w-3.5 mr-2" />
          Eksportuj do CSV
        </Button>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-[#E8E3D8] rounded-none shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#C1A88C]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#C1A88C]" />
              </div>
              <div>
                <p className="text-2xl font-serif text-[#C1A88C]">
                  {subscribers.length}
                </p>
                <p className="text-xs text-black/50 uppercase tracking-widest">
                  Zapisanych
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E8E3D8] rounded-none shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#C1A88C]/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-[#C1A88C]" />
              </div>
              <div>
                <p className="text-2xl font-serif text-[#C1A88C]">
                  {subscribers.filter((s) => s.consent).length}
                </p>
                <p className="text-xs text-black/50 uppercase tracking-widest">
                  Ze zgodą
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      {subscribers.length === 0 ? (
        <Card className="border-[#E8E3D8] rounded-none shadow-none">
          <CardContent className="p-12 text-center">
            <Mail className="h-8 w-8 text-[#C1A88C]/40 mx-auto mb-4" />
            <p className="text-sm text-black/40 mb-1">
              Brak zapisanych do newslettera
            </p>
            <p className="text-xs text-black/30">
              Gdy ktoś się zapisze, pojawi się tutaj.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#E8E3D8] rounded-none shadow-none overflow-hidden">
          <CardHeader className="border-b border-[#E8E3D8] bg-[#FDFBF7]/50 px-6 py-4">
            <CardTitle className="text-xs uppercase tracking-widest text-black/60 font-medium">
              Lista subskrybentów ({subscribers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E3D8]">
                    <th className="text-left text-[10px] uppercase tracking-widest text-black/40 font-medium px-6 py-3">
                      #
                    </th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-black/40 font-medium px-6 py-3">
                      Email
                    </th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-black/40 font-medium px-6 py-3">
                      Data zapisania
                    </th>
                    <th className="text-left text-[10px] uppercase tracking-widest text-black/40 font-medium px-6 py-3">
                      Zgoda
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber, index) => (
                    <tr
                      key={subscriber.id}
                      className="border-b border-[#E8E3D8]/60 last:border-0 hover:bg-[#FDFBF7]/60 transition-colors"
                    >
                      <td className="px-6 py-3.5 text-xs text-black/30">
                        {index + 1}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-neutral-700 font-medium">
                          {subscriber.email}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-black/50">
                        {formatDate(subscriber.createdAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        {subscriber.consent ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Tak
                          </span>
                        ) : (
                          <span className="text-xs text-red-400">Nie</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
