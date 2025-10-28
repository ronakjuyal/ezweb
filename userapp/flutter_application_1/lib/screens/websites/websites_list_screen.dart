import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/website_provider.dart';
import '../auth/login_screen.dart';
import 'website_detail_screen.dart';
import 'create_website_dialog.dart';

class WebsitesListScreen extends StatefulWidget {
  const WebsitesListScreen({super.key});

  @override
  State<WebsitesListScreen> createState() => _WebsitesListScreenState();
}

class _WebsitesListScreenState extends State<WebsitesListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<WebsiteProvider>(context, listen: false).fetchWebsites();
    });
  }

  Future<void> _showCreateWebsiteDialog() async {
    await showDialog(
      context: context,
      builder: (context) => const CreateWebsiteDialog(),
    );
  }

  Future<void> _handleLogout() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.logout();
    if (mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Websites'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Consumer<WebsiteProvider>(
        builder: (context, websiteProvider, _) {
          if (websiteProvider.isLoading && websiteProvider.websites.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (websiteProvider.websites.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.web_asset_off,
                    size: 80,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No websites yet',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create your first website to get started',
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _showCreateWebsiteDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Create Website'),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => websiteProvider.fetchWebsites(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: websiteProvider.websites.length,
              itemBuilder: (context, index) {
                final website = websiteProvider.websites[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: CircleAvatar(
                      backgroundColor: Theme.of(context).primaryColor,
                      child: const Icon(Icons.web, color: Colors.white),
                    ),
                    title: Text(
                      website.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(
                          '${website.subdomain}.ezweb.com',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                        if (website.description != null) ...[
                          const SizedBox(height: 8),
                          Text(website.description!),
                        ],
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: website.published
                                    ? Colors.green[100]
                                    : Colors.orange[100],
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                website.published ? 'Published' : 'Draft',
                                style: TextStyle(
                                  color: website.published
                                      ? Colors.green[800]
                                      : Colors.orange[800],
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios),
                    onTap: () {
                      websiteProvider.selectWebsite(website);
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const WebsiteDetailScreen(),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateWebsiteDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}
