"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, AlertTriangle, Shield, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { DatePickerWithRange } from "@/components/date-range-picker"
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
import { formatIndianNumber } from "@/lib/utils"
import { motion } from "framer-motion"

interface NavButtonProps {
  onClick: () => void;
  label: string;
}

interface MobileNavButtonProps {
  onClick: () => void;
  label: string;
}

export default function ScamsPage() {
  const [activeTab, setActiveTab] = useState("types")
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sourcesData, setSourcesData] = useState<SourceItem[]>([])
  const [isLoadingSources, setIsLoadingSources] = useState(true)
  const [pageViews, setPageViews] = useState<number>(0)
  // const [uniqueVisitors, setUniqueVisitors] = useState<number>(0)

  const [currentSourcePage, setCurrentSourcePage] = useState(1);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const itemsPerPage = 6;
  const tableItemsPerPage = 8;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Add view counter effect
  useEffect(() => {
    const incrementViews = async () => {
      try {
        const response = await fetch('/api/views', { method: 'POST' });
        const data = await response.json();
        setPageViews(data.views);
        // setUniqueVisitors(data.uniqueVisitors);
      } catch (err) {
        console.error('Failed to increment views:', err);
      }
    };
    incrementViews();
  }, []);

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
          url: item.url,
          publishedAt: item.publishedAt
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
          location: item.location,
          publishedAt: item.publishedAt
        }))
    : [];

  // Update pagination calculations with null checks
  const totalSourcePages = Math.ceil((Array.isArray(sourcesData) ? sourcesData.length : 0) / itemsPerPage);
  const totalTablePages = Math.ceil((Array.isArray(sourcesData) ? sourcesData.length : 0) / tableItemsPerPage);

  const fadeInUp = {
    initial: { opacity: 1, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };


  const alertCircleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [1, 1.2, 1],
      opacity: [0.1, 0.2, 0],
      transition: { 
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingIconVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0.3 },
    animate: {
      opacity: [0.3, 0.5, 0.3],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Finosauras Logo"
                  width={340}
                  height={240}
                  priority
                  className="h-28 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex md:space-x-1">
              <NavButton
                onClick={() => document.getElementById('landing-section')?.scrollIntoView({ behavior: 'smooth' })}
                label="Home"
              />
              <NavButton
                onClick={() => document.getElementById('summary-section')?.scrollIntoView({ behavior: 'smooth' })}
                label="Summary"
              />
              <NavButton
                onClick={() => document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' })}
                label="Visuals"
              />
              <NavButton
                onClick={() => document.getElementById('data-section')?.scrollIntoView({ behavior: 'smooth' })}
                label="Sources"
              />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMobileMenuOpen
                ? 'max-h-64 opacity-100'
                : 'max-h-0 opacity-0 pointer-events-none'
            }`}
          >
            <div className="py-4 space-y-2">
              <MobileNavButton
                onClick={() => {
                  document.getElementById('landing-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                label="Home"
              />
              <MobileNavButton
                onClick={() => {
                  document.getElementById('summary-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                label="Summary"
              />
              <MobileNavButton
                onClick={() => {
                  document.getElementById('analysis-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                label="Visuals"
              />
              <MobileNavButton
                onClick={() => {
                  document.getElementById('data-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                label="Sources"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Landing Page Section */}
      <section id="landing-section" className="min-h-screen pt-16 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Floating Warning Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/6 text-red-500/20"
            variants={floatingIconVariants}
            initial="initial"
            animate="animate"
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <AlertTriangle size={48} />
          </motion.div>
          <motion.div
            className="absolute bottom-1/3 right-1/6 text-yellow-500/20"
            variants={floatingIconVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 1 }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <AlertCircle size={40} />
          </motion.div>
          <motion.div
            className="absolute top-1/3 right-1/4 text-orange-500/20"
            variants={floatingIconVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 2 }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <Shield size={44} />
          </motion.div>
        </div>

        {/* Alert Circles Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-red-500/5"
            variants={alertCircleVariants}
            initial="initial"
            animate="animate"
            style={{ originX: 0.5, originY: 0.5 }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-yellow-500/5"
            variants={alertCircleVariants}
            initial="initial"
            animate="animate"
            style={{ originX: 0.5, originY: 0.5 }}
            transition={{ delay: 1 }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-orange-500/5"
            variants={alertCircleVariants}
            initial="initial"
            animate="animate"
            style={{ originX: 0.5, originY: 0.5 }}
            transition={{ delay: 2 }}
          />
        </div>

        {/* Content */}
        <motion.div 
          className="z-10 text-center space-y-8 relative"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <div className="space-y-4">
            <motion.h1 
              className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600 relative"
              variants={fadeInUp}
            >
              Scams in India
              <motion.span
                className="absolute -z-10 blur-2xl opacity-30 w-full h-full bg-gradient-to-r from-blue-600 to-teal-600"
                variants={glowVariants}
              />
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-800 max-w-2xl mx-auto backdrop-blur-sm bg-white/30 p-4 rounded-lg"
              variants={fadeInUp}
            >
              Tracking and Analyzing Financial Fraud Cases Across the Nation
            </motion.p>
            <motion.div 
              className="flex justify-center gap-4 mt-4 text-sm text-gray-700 backdrop-blur-sm bg-white/50 py-2 px-4 rounded-full shadow-lg"
              variants={fadeInUp}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: 2 
                }}
              >
                👁️ {pageViews.toLocaleString()} total views
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Summary Section */}
      <section id="summary-section" className="min-h-screen pt-16 pb-10 flex flex-col items-center px-4">
        <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
          Summary Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
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
      </section>

      {/* Analysis Section */}
      <section id="analysis-section" className="min-h-screen pt-16 pb-10 flex flex-col items-center px-4 bg-gradient-to-b from-white to-gray-50">
        <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
          Analysis Dashboard
        </h2>
        <div className="w-full max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg text-xs sm:text-base">
              <TabsTrigger value="types" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all">
                Scam Types
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all">
                Monthly Trends
              </TabsTrigger>
              <TabsTrigger value="geo" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all">
                Geo Distribution
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
        </div>
      </section>

      {/* Data Section */}
      <section id="data-section" className="min-h-screen pt-16 pb-10 flex flex-col items-center px-4">
        <h2 className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600">
          Data Overview
        </h2>
        <div className="w-full max-w-7xl">
          <Tabs defaultValue="sources" className="mb-8">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg text-xs sm:text-base">
              <TabsTrigger value="sources" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all">
                Sources
              </TabsTrigger>
              <TabsTrigger value="tables" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 rounded-lg transition-all">
                Tables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sources" className="mt-8">
              {isLoadingSources ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8">
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
              <Card className="bg-white shadow-lg overflow-x-auto">
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
                      <div className="min-w-full overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Serial No.</TableHead>
                              <TableHead className="w-[120px]">Type of Scam</TableHead>
                              <TableHead className="max-w-[200px]">
                                <div className="truncate">URL</div>
                              </TableHead>
                              <TableHead className="w-[160px]">Amount</TableHead>
                              <TableHead className="w-[160px]">Location</TableHead>
                              <TableHead className="w-[140px]">Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentTableData.map((row) => (
                              <TableRow key={row.serialNo}>
                                <TableCell className="whitespace-nowrap">{row.serialNo}</TableCell>
                                <TableCell className="whitespace-nowrap">{row.type}</TableCell>
                                <TableCell className="max-w-[200px]">
                                  <div className="truncate">
                                    <Link href={row.url} className="text-blue-600 hover:underline">
                                      {row.url}
                                    </Link>
                                  </div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">₹{formatIndianNumber(row.amount)}</TableCell>
                                <TableCell className="whitespace-nowrap">{row.location}</TableCell>
                                <TableCell className="whitespace-nowrap">{new Date(row.publishedAt).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

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
      </section>
    </div>
  )
}

function SourceCard({ title, description, url, publishedAt }: { 
  title: string; 
  description: string; 
  url: string;
  publishedAt: string;
}) {
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Card className="bg-white shadow-lg transition-all hover:shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-gray-500">{formattedDate}</p>
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

function NavButton({ onClick, label }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative px-5 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors group"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 transition-transform group-hover:scale-x-100" />
    </button>
  );
}

function MobileNavButton({ onClick, label }: MobileNavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="block w-full px-4 py-3 text-left text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
    >
      {label}
    </button>
  );
}

