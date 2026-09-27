Infinite Harness
=====
a simple tool for recursive self improvement
-----

The infinite harness is a tool for gradual improvement of any given harness for any given purpose.

# How it works

Imagine an agent, whom we will refer to as the Chief of Staff (CoS), whose job it is to manage $n$ teams of agents who are working on $n$ Projects, $P^1 ... P^n$. According to the IH, the primary goal of the CoS is to keep track of available resources and the relative priorities for each Project, to allocate those resources, and to oversee the optimization of the Harness $H^i$ used for each Project $P^i$.

# Launching a new Project

When a new Project $P^i$ is handed to the CoS, the first step is for the CoS to create a harness for that project, $H^i$. This harness might use markdown files such as SKILL files, etc. Memory storage may be in local files or may be stored in graph database (such as a Tapestry instance), or may use whatever other harness design the CoS sees fit. We also define a Goal, $G^i$, which is to fulfill the purpose of the Project: build the thing, write the thing, do the thing, achieve whatever is demanded by the Project. The CoS may or may not (probably yes) spin up a dedicated Agent, $A^i$, to manage this project using this harness (the Project Manager). We call these the primary goal $G^i$, primary harness $H^i$, and the primary Project Manager $A^i$ for the $i^{th}$ Project, $P^i$.

The CoS then immediately launches a new Goal, designated with the subscript: $1$, $G^i_1$, with corresponding Harness $H^i_1$ and agent $A^i_1$, the purpose of which is to improve the "primary" or "baseline" harness, which we designate with the subscript $0$: $H^i = H^i_0$. [1] We may refer to these as the level-1 goal, the level-1 harness, and the level-1 agent for the Project.

This process can be repeated an arbitrary number of times. For each step up to the next (the $j^{th}$ rung of the ladder, we create a a new Goal, $G^i_j$, with corresponding Harness $H^i_j$ and agent $A^i_j$ (the $j^{th}$ Rung Manager for Project $i$), with the Goal $G^i_j$ being to improve the harness of the rung below it, $H^i_(j-1)$.

## How many rungs in the ladder?

We don't launch new rungs willy nilly. The CoS and the Project Manager for any given project must work together to decide, not only when it is time to take another step up, but also how often to call any given Rung Manager and how many resources to dedicate to it.

# Infinite Ladder for the Infinite Ladder

The Infinite Ladder is its own project. We will define it as the first (so $i = 0$) project, $P^i_0$. The CoS is the Agent / Project Manager $A^i_0$ for $P^i_0$. The purpose of this repository is to build the baseline of the infinite harness, $H^i_0$.

# Duties of the CoS

- monitor available resources and make sure they are being allocated efficiently
- confer with the Project Manager of the $i^{th}$ Project to decide when it is time to take another step up the ladder for that project
- manage the schedule and allocation of resources to each project and to each level of the ladder for each Project.

More duties will be fleshed out as we develop this harness in greater detail.

[1] We will use the subscript $0$ to distinguish the primary Project, Goal, Harness, and Agent from what follows, but can abbreviate them without the subscript: $H^i = H^i_0, P^i = P^i_0, $G^i = G^i_0, $A^i = A^i_0$. 
