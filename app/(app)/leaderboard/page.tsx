"use client";

import { useEffect, useState } from "react";
import { 
    Trophy, 
    Search, 
    Building2, 
    Lightbulb, 
    CheckCircle2, 
    Sparkles, 
    User, 
    ChevronRight, 
    AlertCircle,
    Medal
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardItem {
    userId: number;
    fullName: string;
    factoryName: string;
    departmentName: string;
    totalPoints: number;
    totalIdeas: number;
    approvedIdeas: number;
}

export default function LeaderboardPage() {
    const [data, setData] = useState<LeaderboardItem[]>([]);
    const [filteredData, setFilteredData] = useState<LeaderboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFactory, setSelectedFactory] = useState("ALL");
    const [factories, setFactories] = useState<string[]>([]);

    async function fetchLeaderboard() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/leaderboard");
            const resJson = await res.json();
            if (res.ok && resJson.success) {
                setData(resJson.data || []);
                
                // Extract unique factories
                const uniqueFactories: string[] = Array.from(
                    new Set(resJson.data.map((item: LeaderboardItem) => item.factoryName).filter(Boolean))
                );
                setFactories(uniqueFactories);
            } else {
                setError(resJson.error || "Failed to load leaderboard");
                toast.error(resJson.error || "Failed to load leaderboard");
            }
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
            setError("Something went wrong. Please try again.");
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    // Handle Filtering
    useEffect(() => {
        let result = data;

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(item => 
                item.fullName.toLowerCase().includes(query) ||
                item.departmentName.toLowerCase().includes(query)
            );
        }

        if (selectedFactory !== "ALL") {
            result = result.filter(item => item.factoryName === selectedFactory);
        }

        setFilteredData(result);
    }, [searchQuery, selectedFactory, data]);

    const topThree = data.slice(0, 3);
    const restOfUsers = filteredData; // Search & filter apply to the table list below

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .filter(Boolean)
            .map(word => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm text-muted-foreground animate-pulse">Loading rankings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[80vh] items-center justify-center px-4">
                <Card className="max-w-md w-full border-destructive/30">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-lg">Unable to load leaderboard</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pt-2">
                        <button 
                            onClick={fetchLeaderboard}
                            className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                            Retry
                        </button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-1 py-4">
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <Trophy className="h-8 w-8 text-yellow-500 fill-yellow-500/20" />
                        Innovator Leaderboard
                    </h1>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                        Recognizing and celebrating top idea contributors and implementers across IFB.
                    </p>
                </div>
                <Badge variant="secondary" className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Live Standings
                </Badge>
            </div>

            {/* Podium (Top 3) */}
            {topThree.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4 max-w-4xl mx-auto">
                    {/* 2nd Place */}
                    {topThree[1] && (
                        <div className="order-2 md:order-1 flex flex-col items-center">
                            <div className="relative mb-3 flex flex-col items-center">
                                <Avatar className="h-20 w-20 ring-4 ring-slate-300 dark:ring-slate-600 shadow-xl">
                                    <AvatarFallback className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-lg">
                                        {getInitials(topThree[1].fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-3 bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-50 font-black text-xs px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white dark:border-zinc-800">
                                    <Medal className="h-3 w-3" />
                                    2nd
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-bold text-base line-clamp-1">{topThree[1].fullName}</h3>
                                <p className="text-xs text-muted-foreground">{topThree[1].factoryName}</p>
                                <div className="inline-flex items-center bg-slate-500/10 text-slate-700 dark:text-slate-300 font-bold text-xs px-2.5 py-1 rounded-full border border-slate-500/20">
                                    {topThree[1].totalPoints} pts
                                </div>
                            </div>
                            <div className="w-full bg-slate-300/40 dark:bg-slate-700/40 border border-slate-300/50 dark:border-slate-700/50 rounded-t-xl h-24 mt-4 flex items-center justify-center font-bold text-2xl text-slate-500 dark:text-slate-400">
                                II
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                        <div className="order-1 md:order-2 flex flex-col items-center -mt-8">
                            <div className="relative mb-3 flex flex-col items-center scale-110">
                                <Avatar className="h-24 w-24 ring-4 ring-yellow-400 dark:ring-yellow-500 shadow-2xl">
                                    <AvatarFallback className="bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 font-extrabold text-xl">
                                        {getInitials(topThree[0].fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-3.5 bg-yellow-400 dark:bg-yellow-500 text-yellow-950 font-black text-sm px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-white dark:border-zinc-800 animate-bounce">
                                    <Trophy className="h-3 w-3 fill-yellow-950" />
                                    1st
                                </div>
                            </div>
                            <div className="text-center space-y-1 mt-2">
                                <h3 className="font-extrabold text-lg line-clamp-1">{topThree[0].fullName}</h3>
                                <p className="text-xs text-muted-foreground">{topThree[0].factoryName}</p>
                                <div className="inline-flex items-center bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-extrabold text-sm px-3.5 py-1 rounded-full border border-yellow-500/35 shadow-sm">
                                    {topThree[0].totalPoints} pts
                                </div>
                            </div>
                            <div className="w-full bg-yellow-400/20 dark:bg-yellow-500/10 border border-yellow-400/30 dark:border-yellow-500/20 rounded-t-xl h-36 mt-4 flex flex-col items-center justify-center font-extrabold text-3xl text-yellow-500 dark:text-yellow-400">
                                <Trophy className="h-8 w-8 mb-1 animate-pulse" />
                                I
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <div className="order-3 flex flex-col items-center">
                            <div className="relative mb-3 flex flex-col items-center">
                                <Avatar className="h-20 w-20 ring-4 ring-amber-600/70 dark:ring-amber-700 shadow-xl">
                                    <AvatarFallback className="bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-500 font-bold text-lg">
                                        {getInitials(topThree[2].fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-3 bg-amber-600 dark:bg-amber-700 text-white font-black text-xs px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white dark:border-zinc-800">
                                    <Medal className="h-3 w-3" />
                                    3rd
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-bold text-base line-clamp-1">{topThree[2].fullName}</h3>
                                <p className="text-xs text-muted-foreground">{topThree[2].factoryName}</p>
                                <div className="inline-flex items-center bg-amber-600/10 text-amber-700 dark:text-amber-500 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-600/20">
                                    {topThree[2].totalPoints} pts
                                </div>
                            </div>
                            <div className="w-full bg-amber-600/20 dark:bg-amber-900/10 border border-amber-600/30 dark:border-amber-900/20 rounded-t-xl h-20 mt-4 flex items-center justify-center font-bold text-2xl text-amber-600 dark:text-amber-500">
                                III
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Filter and Table Section */}
            <Card className="border border-border bg-card shadow-sm rounded-xl">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl">All Contributor Rankings</CardTitle>
                            <CardDescription className="text-xs">
                                Filter and search details for all active contributors.
                            </CardDescription>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search by name or dept..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9.5 text-xs bg-background/50 border-input"
                                />
                            </div>

                            <div className="w-full sm:w-48">
                                <Select 
                                    value={selectedFactory} 
                                    onValueChange={(val) => setSelectedFactory(val)}
                                >
                                    <SelectTrigger className="h-9.5 text-xs bg-background/50 border-input">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                            <SelectValue placeholder="All Factories" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="ALL">All Factories</SelectItem>
                                        {factories.map((factory) => (
                                            <SelectItem key={factory} value={factory}>
                                                {factory}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-16 text-center font-bold">Rank</TableHead>
                                    <TableHead>Innovator</TableHead>
                                    <TableHead>Factory / Department</TableHead>
                                    <TableHead className="text-center">Ideas Submitted</TableHead>
                                    <TableHead className="text-center">Ideas Approved</TableHead>
                                    <TableHead className="text-right pr-6">Total Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {restOfUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No contributors match the query criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    restOfUsers.map((item, index) => {
                                        // Calculate actual global rank
                                        const globalRank = data.findIndex(d => d.userId === item.userId) + 1;
                                        
                                        // Top rank highlighting
                                        let rankBadge = null;
                                        if (globalRank === 1) {
                                            rankBadge = <Badge className="bg-yellow-400 hover:bg-yellow-400 text-yellow-950 font-black h-6 w-6 p-0 rounded-full flex items-center justify-center">1</Badge>;
                                        } else if (globalRank === 2) {
                                            rankBadge = <Badge className="bg-slate-300 hover:bg-slate-300 text-slate-900 font-black h-6 w-6 p-0 rounded-full flex items-center justify-center">2</Badge>;
                                        } else if (globalRank === 3) {
                                            rankBadge = <Badge className="bg-amber-600 hover:bg-amber-600 text-white font-black h-6 w-6 p-0 rounded-full flex items-center justify-center">3</Badge>;
                                        } else {
                                            rankBadge = <span className="font-semibold text-muted-foreground text-sm">{globalRank}</span>;
                                        }

                                        return (
                                            <TableRow key={item.userId} className="hover:bg-muted/30 transition-all">
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center items-center h-full">
                                                        {rankBadge}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8.5 w-8.5">
                                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                                {getInitials(item.fullName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm leading-tight text-foreground">{item.fullName}</p>
                                                            <p className="text-xxs text-muted-foreground font-medium mt-0.5">ID: {item.userId}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-xs text-foreground">{item.factoryName}</p>
                                                        <p className="text-xxs text-muted-foreground font-normal mt-0.5">{item.departmentName}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-500/5 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/10">
                                                        <Lightbulb className="h-3 w-3" />
                                                        {item.totalIdeas}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        {item.approvedIdeas}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6 font-extrabold text-sm text-foreground">
                                                    {item.totalPoints} pts
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Motivational Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 dark:border-indigo-500/15 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground flex items-center justify-center md:justify-start gap-1.5">
                        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                        Ready to jump on the board?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Earn points for every stage your submitted idea gets approved and when it is successfully implemented.
                    </p>
                </div>
                <a 
                    href="/innovations/new" 
                    className="inline-flex items-center bg-primary hover:bg-primary/95 text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer"
                >
                    Submit New Idea
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </a>
            </div>
        </div>
    );
}