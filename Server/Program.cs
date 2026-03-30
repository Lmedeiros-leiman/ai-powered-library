using Server.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddGrpc();

WebApplication app = builder.Build();

app.UseGrpcWeb();

app.MapGrpcService<GreeterService>().EnableGrpcWeb();

app.MapGet("/", () => "gRPC server. Use a gRPC client to communicate with this server.");

app.Run();