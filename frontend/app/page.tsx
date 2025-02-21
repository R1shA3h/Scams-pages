"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { DailyStats } from "@/components/dashboard/DailyStats"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { fetchSummary } from "@/lib/api/summary"
import type { SummaryResponse } from "@/lib/types/api.types"
import { PageHeader } from "@/components/layout/PageHeader"
import { MonthlyTrends } from "@/components/charts/MonthlyTrends"
import { fetchSources } from "@/lib/api/sources"
import type { SourceItem } from "@/lib/types/api.types"
import { GeoDistribution } from "@/components/dashboard/GeoDistribution"
import { ScamTypesPieChart } from "@/components/dashboard/ScamTypesPieChart"

export default function ScamsPage() {
  const [activeTab, setActiveTab] = useState("types")
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sourcesData, setSourcesData] = useState<SourceItem[]>([])
  const [isLoadingSources, setIsLoadingSources] = useState(true)

  const [currentSourcePage, setCurrentSourcePage] = useState(1);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const itemsPerPage = 6;
  const tableItemsPerPage = 8;

  // Load sources data
  useEffect(() => {
    async function loadSourcesData() {
      setIsLoadingSources(true);
      try {
        const response = await fetchSources();
        console.log('API Response:', response);
        
        // Ensure we're working with an array
        if (response && Array.isArray(response.data)) {
          setSourcesData(response.data);
        } else {
          console.error('Invalid data format received:', response);
          setSourcesData([]);
        }
      } catch (err) {
        console.error("Error loading sources:", err);
        setError(err instanceof Error ? err.message : "Failed to load sources data");
        setSourcesData([]);
      } finally {
        setIsLoadingSources(false);
      }
    }

    loadSourcesData();
  }, []);

  // Load summary data
  useEffect(() => {
    async function loadSummaryData() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchSummary()
        setSummaryData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load summary data")
      } finally {
        setIsLoading(false)
      }
    }

    loadSummaryData()
  }, [])

  // Pagination helper function
  const getPageRange = (currentPage: number, totalPages: number) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const handleSourcePageChange = (page: number) => {
    setCurrentSourcePage(page);
  };

  const handleTablePageChange = (page: number) => {
    setCurrentTablePage(page);
  };

  // Calculate current items for both tabs with null checks
  const currentSources = Array.isArray(sourcesData) 
    ? sourcesData
        .slice((currentSourcePage - 1) * itemsPerPage, currentSourcePage * itemsPerPage)
        .map(item => ({
          title: item.source,
          description: item.title,
          url: item.url
        }))
    : [];

  const currentTableData = Array.isArray(sourcesData)
    ? sourcesData
        .slice((currentTablePage - 1) * tableItemsPerPage, currentTablePage * tableItemsPerPage)
        .map((item, index) => ({
          serialNo: ((currentTablePage - 1) * tableItemsPerPage) + index + 1,
          type: item.scamType,
          url: item.url,
          amount: item.scamAmount,
          location: item.location
        }))
    : [];

  // Update pagination calculations with null checks
  const totalSourcePages = Math.ceil((Array.isArray(sourcesData) ? sourcesData.length : 0) / itemsPerPage);
  const totalTablePages = Math.ceil((Array.isArray(sourcesData) ? sourcesData.length : 0) / tableItemsPerPage);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="container mx-auto p-8">
          <PageHeader />
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            <h3 className="text-lg font-semibold">Error Loading Data</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto p-4">
        <PageHeader />
        
        <div className="mb-4 max-w-md mx-auto">
          <DatePickerWithRange />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-8">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : summaryData ? (
            <>
              <DailyStats 
                data={summaryData.daily}
                title="Today's Summary"
              />
              <DailyStats 
                data={summaryData.weekly}
                title="This Week"
              />
              <DailyStats 
                data={summaryData.monthly}
                title="This Month"
              />
              <DailyStats 
                data={summaryData.yearly}
                title="This Year"
              />
            </>
          ) : null}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-16">
          <TabsList className="grid w-full grid-cols-3 bg-gray-200 p-1 rounded-lg">
            <TabsTrigger value="types" className="data-[state=active]:bg-white rounded-md">
              Scam Types
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-white rounded-md">
              Monthly Trends
            </TabsTrigger>
            <TabsTrigger value="geo" className="data-[state=active]:bg-white rounded-md">
              Geographical Distribution
            </TabsTrigger>
          </TabsList>
          <TabsContent value="types" className="mt-8">
            <ScamTypesPieChart />
          </TabsContent>
          <TabsContent value="trends" className="mt-8">
            <MonthlyTrends />
          </TabsContent>
          <TabsContent value="geo">
            <GeoDistribution />
          </TabsContent>
        </Tabs>

        {/* Sources and Tables tabs */}
        <Tabs defaultValue="sources" className="mb-16">
          <TabsList className="grid w-full grid-cols-2 bg-gray-200 p-1 rounded-lg">
            <TabsTrigger value="sources" className="data-[state=active]:bg-white rounded-md">
              Sources
            </TabsTrigger>
            <TabsTrigger value="tables" className="data-[state=active]:bg-white rounded-md">
              Tables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="mt-8">
            {isLoadingSources ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">Error: {error}</p>
              </div>
            ) : sourcesData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No sources available</p>
                <button 
                  onClick={() => fetchSources()} 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry Loading
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {currentSources.map((source, index) => (
                    <SourceCard key={index} {...source} />
                  ))}
                </div>
                {totalSourcePages > 1 && (
                  <Pagination className="my-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handleSourcePageChange(Math.max(1, currentSourcePage - 1))}
                          className={cn(
                            "cursor-pointer",
                            currentSourcePage === 1 && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>
                      
                      {getPageRange(currentSourcePage, totalSourcePages).map((page, index) => (
                        <PaginationItem key={index}>
                          {page === '...' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              isActive={currentSourcePage === Number(page)}
                              onClick={() => handleSourcePageChange(Number(page))}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handleSourcePageChange(Math.min(totalSourcePages, currentSourcePage + 1))}
                          className={cn(
                            "cursor-pointer",
                            currentSourcePage === totalSourcePages && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="tables" className="mt-8">
            <Card className="bg-white shadow-lg">
              <CardContent>
                {isLoadingSources ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-6 bg-gray-100 rounded w-full mb-2"></div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">Error: {error}</p>
                  </div>
                ) : sourcesData.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No data available</p>
                    <button 
                      onClick={() => {
                        setIsLoadingSources(true);
                        fetchSources().then(response => {
                          setSourcesData(response.data);
                          setIsLoadingSources(false);
                        }).catch(err => {
                          setError(err.message);
                          setIsLoadingSources(false);
                        });
                      }} 
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Serial No.</TableHead>
                          <TableHead>Type of Scam</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTableData.map((row) => (
                          <TableRow key={row.serialNo}>
                            <TableCell>{row.serialNo}</TableCell>
                            <TableCell>{row.type}</TableCell>
                            <TableCell>
                              <Link href={row.url} className="text-blue-600 hover:underline">
                                {row.url}
                              </Link>
                            </TableCell>
                            <TableCell>₹{row.amount.toLocaleString()}</TableCell>
                            <TableCell>{row.location}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {totalTablePages > 1 && (
                      <Pagination className="mt-8">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => handleTablePageChange(Math.max(1, currentTablePage - 1))}
                              className={cn(
                                "cursor-pointer",
                                currentTablePage === 1 && "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                          
                          {getPageRange(currentTablePage, totalTablePages).map((page, index) => (
                            <PaginationItem key={index}>
                              {page === '...' ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  isActive={currentTablePage === Number(page)}
                                  onClick={() => handleTablePageChange(Number(page))}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => handleTablePageChange(Math.min(totalTablePages, currentTablePage + 1))}
                              className={cn(
                                "cursor-pointer",
                                currentTablePage === totalTablePages && "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function SourceCard({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <Card className="bg-white shadow-lg transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-600">{description}</p>
        <Link href={url} className="text-blue-600 hover:underline">
          Read More
        </Link>
      </CardContent>
    </Card>
  )
}

